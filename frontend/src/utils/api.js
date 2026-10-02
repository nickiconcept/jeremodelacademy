const API_BASE = import.meta.env.VITE_API_URL || '/api';
import {
  cacheOfflineValue,
  enqueueOfflineRequest,
  getOfflineQueue,
  readOfflineValue,
  removeOfflineRequest,
  updateOfflineRequest,
} from './offlineStore';

const OFFLINE_QUEUEABLE_ENDPOINTS = new Set([
  '/attendance/save',
  '/grades/save',
  '/sow/mark-treated',
]);
let activeSyncPromise = null;

function isNetworkFailure(error) {
  return error?.status == null && (error instanceof TypeError || (typeof navigator !== 'undefined' && !navigator.onLine));
}

function getOfflineSessionUserId() {
  try {
    const session = JSON.parse(localStorage.getItem('jma_offline_session') || '{}');
    if (session.user?.role !== 'teacher' || !session.user.id) return null;
    const token = localStorage.getItem('jma_token');
    const payload = token?.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    return String(claims.sub) === String(session.user.id) ? session.user.id : null;
  } catch {
    return null;
  }
}

function emitOfflineQueueChange() {
  window.dispatchEvent(new CustomEvent('jma-offline-queue-change'));
}

function getHeaders() {
  const token = localStorage.getItem('jma_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || data.message || 'Something went wrong');
      error.status = response.status;
      error.contentType = contentType;
      error.url = response.url;
      error.response = { data, status: response.status, contentType, url: response.url };
      throw error;
    }
    // Auto-cast Laravel decimal strings to Numbers to prevent string concatenation math bugs in React
    const numericKeys = ['amount_due', 'amount_paid', 'amount', 'score', 'total_billed', 'total_paid', 'balance', 'fee_amount'];
    
    const castNumerics = (obj) => {
      if (Array.isArray(obj)) {
        obj.forEach(castNumerics);
      } else if (obj !== null && typeof obj === 'object') {
        for (let key in obj) {
          if (numericKeys.includes(key) && typeof obj[key] === 'string' && !isNaN(Number(obj[key]))) {
            obj[key] = Number(obj[key]);
          } else if (typeof obj[key] === 'object') {
            castNumerics(obj[key]);
          }
        }
      }
      return obj;
    };
    
    return castNumerics(data);
  } else {
    const text = await response.text();
    if (!response.ok) {
      const error = new Error(`Server error (${response.status}): ${text.slice(0, 150)}`);
      error.status = response.status;
      error.contentType = contentType;
      error.url = response.url;
      error.response = { status: response.status, contentType, url: response.url };
      throw error;
    }
    throw new Error('Server returned non-JSON response');
  }
}

async function fetchAPI(endpoint, options = {}) {
  const headers = options.headers || {};
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  headers['Accept'] = 'application/json';
  const token = localStorage.getItem('jma_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  const data = await handleResponse(res);
  return { data: data?.data || data };
}

async function requestWithOfflineSupport(endpoint, options = {}, { cacheKey = null, queueWhenOffline = false } = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...getHeaders(), ...(options.headers || {}) };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, method, headers });
    const data = await handleResponse(response);
    if (method === 'GET' && cacheKey) {
      await cacheOfflineValue(cacheKey, data).catch(() => {});
    }
    return data;
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;

    if (method === 'GET' && cacheKey) {
      const cachedValue = await readOfflineValue(cacheKey).catch(() => null);
      if (cachedValue !== null) return cachedValue;
    }

    if (method !== 'GET' && queueWhenOffline) {
      let body = options.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { throw error; }
      }
      if (endpoint === '/attendance/save' && body && typeof body === 'object') {
        body = { ...body, offline_sync: true, captured_at: body.captured_at || new Date().toISOString() };
      }
      const queuedRequest = await enqueueOfflineRequest({ endpoint, method, body });
      emitOfflineQueueChange();
      return {
        offlineQueued: true,
        queueId: queuedRequest.id,
        message: 'Saved on this device. It will sync when you are online.',
      };
    }

    throw error;
  }
}

async function syncOfflineRequests() {
  if (activeSyncPromise) return activeSyncPromise;
  const userId = getOfflineSessionUserId();
  if (!userId) return { synced: 0, pending: 0, needsAttention: 0, message: 'Sign in online to sync pending work.' };
  if (!navigator.onLine) {
    const queue = await getOfflineQueue(userId);
    return { synced: 0, pending: queue.filter((item) => !item.blocked).length, needsAttention: queue.filter((item) => item.blocked).length, message: 'Connect to the internet before syncing.' };
  }

  activeSyncPromise = (async () => {
    const queue = await getOfflineQueue(userId);
    let synced = 0;
    let needsAttention = 0;
    let message = '';

    for (const item of queue) {
      if (item.blocked) {
        needsAttention += 1;
        continue;
      }

      try {
        const response = await fetch(`${API_BASE}${item.endpoint}`, {
          method: item.method,
          headers: getHeaders(),
          body: JSON.stringify(item.body),
        });
        await handleResponse(response);
        await removeOfflineRequest(item.id);
        synced += 1;
      } catch (error) {
        const blocked = [403, 409, 422].includes(error?.status);
        await updateOfflineRequest({
          ...item,
          attempts: (item.attempts || 0) + 1,
          lastError: error.message || 'Sync failed.',
          blocked,
        });
        if (blocked) needsAttention += 1;
        if (error?.status === 401) {
          message = 'Sign in again to sync pending work.';
          break;
        }
        if (isNetworkFailure(error)) {
          message = 'Connection lost. Remaining work is still saved on this device.';
          break;
        }
      }
    }

    emitOfflineQueueChange();
    const remaining = await getOfflineQueue(userId);
    window.dispatchEvent(new CustomEvent('jma-offline-sync-complete', { detail: { synced } }));
    return { synced, pending: remaining.filter((item) => !item.blocked).length, needsAttention: remaining.filter((item) => item.blocked).length, message };
  })();

  try {
    return await activeSyncPromise;
  } finally {
    activeSyncPromise = null;
  }
}

const api = {
  // Authentication
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  login: async (identifier, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await handleResponse(res);
    localStorage.setItem('jma_token', data.token);
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('jma_token');
  },

  // System Settings
  getSettings: async () => {
    return requestWithOfflineSupport('/settings', {}, { cacheKey: '/settings' });
  },

  getPublicSettings: async () => {
    return requestWithOfflineSupport('/settings/public', {}, { cacheKey: '/settings/public' });
  },

  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  // Behavioral Skills Management (Affective & Psychomotor)
  getSkills: async (tier) => {
    let url = `${API_BASE}/skills`;
    if (tier) url += `?tier=${tier}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },
  addSkill: async (skillData) => {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(skillData)
    });
    return handleResponse(res);
  },
  updateSkill: async (id, skillData) => {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(skillData)
    });
    return handleResponse(res);
  },
  deleteSkill: async (id, category) => {
    let url = `${API_BASE}/skills/${id}`;
    if (category) url += `?category=${category}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  getSkillsStudents: async (classId, term, session) => {
    const query = new URLSearchParams({ term, session }).toString();
    const res = await fetch(`${API_BASE}/skills/students/${classId}?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getStudentSkillsEvaluation: async (studentId, term, session) => {
    const query = new URLSearchParams({ term, session }).toString();
    const res = await fetch(`${API_BASE}/skills/evaluations/${studentId}?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  saveStudentSkillsEvaluation: async (evaluationData) => {
    const res = await fetch(`${API_BASE}/skills/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(evaluationData)
    });
    return handleResponse(res);
  },

  // Users Management (Admin)
  getStudents: async () => {
    const res = await fetch(`${API_BASE}/students`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getStudentProfile: async (id) => {
    const res = await fetch(`${API_BASE}/students/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getTeachers: async () => {
    const res = await fetch(`${API_BASE}/teachers`, { headers: getHeaders() });
    return handleResponse(res);
  },

  
  fastTrackGraduate: async (data) => {
    const res = await fetch(`${API_BASE}/students/fast-track-graduate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  registerStudent: async (studentData) => {
    const res = await fetch(`${API_BASE}/users/register-student`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(studentData)
    });
    return handleResponse(res);
  },

  updateStudent: async (id, data) => {
    const res = await fetch(`${API_BASE}/users/update-student/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteStudent: async (id) => {
    const res = await fetch(`${API_BASE}/users/delete-student/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  bulkUpdateStudentStatus: async (student_ids, status) => {
    const res = await fetch(`${API_BASE}/students/bulk-status-update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ student_ids, status })
    });
    return handleResponse(res);
  },

  bulkUpdateStudentClass: async (student_ids, class_id) => {
    const res = await fetch(`${API_BASE}/students/bulk-class-update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ student_ids, class_id })
    });
    return handleResponse(res);
  },

  updateTeacher: async (id, teacherData) => {
    const res = await fetch(`${API_BASE}/users/update-teacher/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(teacherData)
    });
    return handleResponse(res);
  },

  registerTeacher: async (teacherData) => {
    const res = await fetch(`${API_BASE}/users/register-teacher`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(teacherData)
    });
    return handleResponse(res);
  },

  deleteTeacher: async (id) => {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Classes & Subjects Configuration
  getClasses: async () => {
    const res = await fetch(`${API_BASE}/classes`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getWaitingRooms: async () => {
    const res = await fetch(`${API_BASE}/waiting-rooms`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createClass: async (classData) => {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(classData)
    });
    return handleResponse(res);
  },

  editClass: async (id, classData) => {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(classData)
    });
    return handleResponse(res);
  },

  deleteClass: async (id) => {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  assignFormMaster: async (class_id, teacher_id) => {
    const res = await fetch(`${API_BASE}/classes/assign-form-master`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ class_id, teacher_id })
    });
    return handleResponse(res);
  },

  getSubjects: async () => {
    const res = await fetch(`${API_BASE}/subjects`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createSubject: async (subjectData) => {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subjectData)
    });
    return handleResponse(res);
  },

  getClassSubjects: async () => {
    const res = await fetch(`${API_BASE}/class-subjects`, { headers: getHeaders() });
    return handleResponse(res);
  },

  syncClassSubjects: async (class_id, subject_ids) => {
    const res = await fetch(`${API_BASE}/class-subjects/sync-class`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ class_id, subject_ids })
    });
    return handleResponse(res);
  },

  syncTierSubjects: async (tier, subject_ids) => {
    const res = await fetch(`${API_BASE}/class-subjects/sync-tier`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tier, subject_ids })
    });
    return handleResponse(res);
  },

  getTierSubjects: async (tier) => {
    const res = await fetch(`${API_BASE}/tier-subjects/${tier}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  assignSubjectTeacher: async (class_ids, subject_id, teacher_id, overwrite = false) => {
    const res = await fetch(`${API_BASE}/class-subjects/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ class_ids, subject_id, teacher_id, overwrite })
    });
    return handleResponse(res);
  },

  getTeacherAssignments: async () => {
    return requestWithOfflineSupport('/teacher/assignments', {}, { cacheKey: '/teacher/assignments' });
  },

  // Grades entry
  getGradesForEntry: async (classId, subjectId, term, session) => {
    const query = new URLSearchParams({ term, session }).toString();
    const endpoint = `/grades/class-subject/${classId}/${subjectId}?${query}`;
    const grades = await requestWithOfflineSupport(endpoint, {}, { cacheKey: endpoint });
    const queuedGrades = new Map();
    (await getOfflineQueue()).forEach((item) => {
      const payload = item.body;
      if (item.endpoint !== '/grades/save'
        || String(payload.class_id) !== String(classId)
        || String(payload.subject_id) !== String(subjectId)
        || payload.term !== term
        || payload.academic_year !== session) return;
      payload.grades.forEach((grade) => queuedGrades.set(String(grade.student_id), {
        grade,
        blocked: item.blocked,
        error: item.lastError,
      }));
    });
    return grades.map((grade) => {
      const queued = queuedGrades.get(String(grade.student_id));
      return queued
        ? { ...grade, ...queued.grade, offline_pending: true, offline_sync_blocked: queued.blocked, offline_sync_error: queued.error }
        : grade;
    });
  },

  saveGrades: async (gradePayload) => {
    return requestWithOfflineSupport('/grades/save', {
      method: 'POST',
      body: JSON.stringify(gradePayload)
    }, { queueWhenOffline: true });
  },

  // Attendance
  getAttendance: async (classId, date) => {
    const endpoint = `/attendance/${classId}/${date}`;
    const roster = await requestWithOfflineSupport(endpoint, {}, { cacheKey: endpoint });
    const queuedStatuses = new Map();
    (await getOfflineQueue()).forEach((item) => {
      const payload = item.body;
      if (item.endpoint !== '/attendance/save'
        || String(payload.class_id) !== String(classId)
        || payload.date !== date) return;
      payload.records.forEach((record) => queuedStatuses.set(String(record.student_id), {
        status: record.status,
        originalStatus: record.original_status ?? null,
        blocked: item.blocked,
        error: item.lastError,
      }));
    });
    return roster.map((student) => {
      const queued = queuedStatuses.get(String(student.student_id));
      return queued
        ? { ...student, status: queued.status, original_status: queued.originalStatus, offline_pending: true, offline_sync_blocked: queued.blocked, offline_sync_error: queued.error }
        : student;
    });
  },

  getStudentAttendance: async (studentId) => {
    const res = await fetch(`${API_BASE}/attendance/student/${studentId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  saveAttendance: async (attendancePayload) => {
    return requestWithOfflineSupport('/attendance/save', {
      method: 'POST',
      body: JSON.stringify(attendancePayload)
    }, { queueWhenOffline: true });
  },

  // Broadsheets
  getBroadsheet: async (classId, term, session) => {
    const res = await fetch(`${API_BASE}/broadsheet/${classId}?term=${term}&session=${session}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Result Pins
  generatePins: async (count, term, academic_year) => {
    const res = await fetch(`${API_BASE}/pins/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ count, term, academic_year })
    });
    return handleResponse(res);
  },

  getPins: async () => {
    const res = await fetch(`${API_BASE}/pins`, { headers: getHeaders() });
    return handleResponse(res);
  },

  verifyPin: async (pin, term, academic_year) => {
    const res = await fetch(`${API_BASE}/pins/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pin, term, academic_year })
    });
    return handleResponse(res);
  },

  // Report Card
  getReportCard: async (studentId, term, year) => {
    const res = await fetch(`${API_BASE}/report-card/${studentId}?term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}&t=${Date.now()}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getStudentRemarks: async (studentId, term, year) => {
    const res = await fetch(`${API_BASE}/remarks/${studentId}?term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  saveRemark: async (remarkData) => {
    const res = await fetch(`${API_BASE}/remarks/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(remarkData)
    });
    return handleResponse(res);
  },

  generateAiRemark: async (remarkData) => {
    const res = await fetch(`${API_BASE}/remarks/generate-ai`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(remarkData)
    });
    return handleResponse(res);
  },

  getBulkReportCards: async (classId, term, year) => {
    const res = await fetch(`${API_BASE}/report-cards/bulk?class_id=${classId}&term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getStudentTimeline: async (studentId) => {
    const res = await fetch(`${API_BASE}/student/timeline/${studentId}?t=${Date.now()}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getResultPublicationCandidates: async (term, academicYear) => {
    const params = new URLSearchParams({ term, academic_year: academicYear });
    const res = await fetch(`${API_BASE}/results/publication-candidates?${params}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  publishResults: async (publicationData) => {
    const res = await fetch(`${API_BASE}/results/publish`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(publicationData)
    });
    return handleResponse(res);
  },

  unpublishResults: async (publicationData) => {
    const res = await fetch(`${API_BASE}/results/unpublish`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(publicationData)
    });
    return handleResponse(res);
  },

  // Result Upload Progress Trackers
  getTeacherResultProgress: async () => {
    const res = await fetch(`${API_BASE}/teacher/result-progress`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getAdminResultProgress: async () => {
    const res = await fetch(`${API_BASE}/admin/result-progress`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Fees / Finance
  getStudentFees: async (studentId) => {
    const res = await fetch(`${API_BASE}/fees/student/${studentId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  addFeeInvoice: async (feeInvoiceData) => {
    // Used by "Bill Students" modal — posts a custom fee to a whole class or tier
    const res = await fetch(`${API_BASE}/fees/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feeInvoiceData)
    });
    return handleResponse(res);
  },

  // Generate termly school fees for ALL active students based on fee structures
  generateTermlyFees: async () => {
    const res = await fetch(`${API_BASE}/fees/generate-termly`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Custom class-based invoices (NOT per-student — assigned to a whole class or tier)
  getCustomInvoices: async () => {
    const res = await fetch(`${API_BASE}/fees/custom-invoices`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Add a custom invoice to a class or tier (same endpoint as addFeeInvoice but semantically separate)
  createCustomInvoice: async (invoiceData) => {
    const res = await fetch(`${API_BASE}/fees/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(invoiceData)
    });
    return handleResponse(res);
  },

  // Delete an entire group of custom invoices by class/title/category
  deleteCustomInvoiceGroup: async (groupData) => {
    const res = await fetch(`${API_BASE}/fees/custom-invoices-group/delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(groupData)
    });
    return handleResponse(res);
  },
  
  updateCustomInvoiceGroup: async (groupData) => {
    const res = await fetch(`${API_BASE}/fees/custom-invoices-group/update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(groupData)
    });
    return handleResponse(res);
  },

  logFeePayment: async (paymentData) => {
    const res = await fetch(`${API_BASE}/fees/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData)
    });
    return handleResponse(res);
  },

  // Student Promotion (Admin)

  promoteBulk: async (source_class_id, target_class_id, selected_student_ids = []) => {
    const res = await fetch(`${API_BASE}/students/promote-bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ source_class_id, target_class_id, selected_student_ids })
    });
    return handleResponse(res);
  },

  getPromotedClasses: async (session_name = '') => {
    const query = session_name ? `?session_name=${encodeURIComponent(session_name)}` : '';
    const res = await fetch(`${API_BASE}/promoted-classes${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  resetPromotedClasses: async (session_name = '') => {
    const res = await fetch(`${API_BASE}/promoted-classes/reset`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ session_name })
    });
    return handleResponse(res);
  },

  promoteIndividual: async (student_id, target_class_id, status) => {
    const res = await fetch(`${API_BASE}/students/promote-individual`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ student_id, target_class_id, status })
    });
    return handleResponse(res);
  },

  getBehavioralGrades: async (studentId, term, year) => {
    const res = await fetch(`${API_BASE}/behavioral/${studentId}?term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  saveBehavioralGrades: async (payload) => {
    const res = await fetch(`${API_BASE}/behavioral/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Schemes of Work
  getSchemes: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const endpoint = `/schemes?${query}`;
    const schemes = await requestWithOfflineSupport(endpoint, {}, { cacheKey: endpoint });
    const queuedSchemeProgress = new Map();
    (await getOfflineQueue()).forEach((item) => {
      const payload = item.body;
      if (item.endpoint !== '/sow/mark-treated'
        || String(payload.class_id) !== String(filters.class_id)
        || payload.academic_session !== filters.academic_session) return;
      queuedSchemeProgress.set(String(payload.scheme_of_work_id), {
        status: item.blocked ? 'sync_blocked' : 'pending_sync',
        note: payload.note || '',
        completed_at: item.createdAt,
        sync_error: item.lastError,
      });
    });
    return schemes.map((scheme) => queuedSchemeProgress.has(String(scheme.id))
      ? { ...scheme, progress: queuedSchemeProgress.get(String(scheme.id)) }
      : scheme);
  },

  saveScheme: async (schemeData) => {
    const res = await fetch(`${API_BASE}/schemes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(schemeData)
    });
    return handleResponse(res);
  },

  deleteScheme: async (id) => {
    const res = await fetch(`${API_BASE}/schemes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  updateUserPermissions: async (userId, permissions) => {
    const res = await fetch(`${API_BASE}/users/update-permissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ user_id: userId, permissions })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update permissions');
    return data;
  },

  // User Status Updates
  updateUserStatus: async (userId, status) => {
    const res = await fetch(`${API_BASE}/users/update-status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, status })
    });
    return handleResponse(res);
  },

  // Subjects Editing & Deleting
  updateSubject: async (id, data) => {
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteSubject: async (id) => {
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Academic Sessions Management
  getAcademicSessions: async () => {
    const res = await fetch(`${API_BASE}/sessions`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createAcademicSession: async (session_name) => {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ session_name })
    });
    return handleResponse(res);
  },

  setActiveSession: async (id) => {
    const res = await fetch(`${API_BASE}/sessions/set-active`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id })
    });
    return handleResponse(res);
  },

  // Attendance Reports
  getAttendanceReport: async (classId, startDate = '', endDate = '') => {
    const query = new URLSearchParams({ start_date: startDate, end_date: endDate }).toString();
    const res = await fetch(`${API_BASE}/attendance/report/${classId}?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Fee Structures CRUD & Audit Report
  getFeeStructures: async () => {
    const res = await fetch(`${API_BASE}/fees/structures`, { headers: getHeaders() });
    return handleResponse(res);
  },

  addFeeStructure: async (title, amount, tier, category = 'School Fees') => {
    const res = await fetch(`${API_BASE}/fees/structures`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, amount, tier, category })
    });
    return handleResponse(res);
  },

  updateFeeStructure: async (id, title, amount, tier, category = 'School Fees') => {
    const res = await fetch(`${API_BASE}/fees/structures/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ title, amount, tier, category })
    });
    return handleResponse(res);
  },

  deleteFeeStructure: async (id) => {
    const res = await fetch(`${API_BASE}/fees/structures/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getPaidFeesReport: async () => {
    const res = await fetch(`${API_BASE}/fees/report`, { headers: getHeaders() });
    return handleResponse(res);
  },
  
  getBulkReceipts: async (classId, term, session, startDate, endDate) => {
    let url = `${API_BASE}/receipts/bulk?class_id=${classId}`;
    if (term) url += `&term=${encodeURIComponent(term)}`;
    if (session) url += `&session=${encodeURIComponent(session)}`;
    if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&end_date=${encodeURIComponent(endDate)}`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Authentication Settings / Profile
  changePassword: async (oldPassword, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword })
    });
    return handleResponse(res);
  },

  // Generic methods for one-off endpoints
  get: async (endpoint, config = {}) => {
    let requestEndpoint = endpoint;
    if (config.params) {
      const qs = new URLSearchParams(config.params).toString();
      if (qs) requestEndpoint += `${requestEndpoint.includes('?') ? '&' : '?'}${qs}`;
    }
    const data = await requestWithOfflineSupport(requestEndpoint);
    return { data };
  },
  
  post: async (endpoint, data = {}) => {
    const queueWhenOffline = OFFLINE_QUEUEABLE_ENDPOINTS.has(endpoint);
    const responseData = await requestWithOfflineSupport(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }, { queueWhenOffline });
    return { data: responseData };
  },

  getOfflineQueue: async () => getOfflineQueue(),
  discardOfflineRequest: async (id) => {
    await removeOfflineRequest(id);
    emitOfflineQueueChange();
  },
  syncOfflineRequests,

  // Upload School Logo
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    // We cannot use getHeaders() directly because it sets 'Content-Type': 'application/json'
    const token = localStorage.getItem('jma_token');
    const headers = {
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/settings/logo`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    return handleResponse(res);
  },

  uploadAboutImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('jma_token');
    const headers = {
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/settings/about-image`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    return handleResponse(res);
  },

  // -------------------------------------------------------------
  // WEBSITE MANAGEMENT & TIMETABLE
  // -------------------------------------------------------------
  getWebsitePublicData: () => fetchAPI('/website/public'),
  getSlides: () => fetchAPI('/website/slides'),
  addSlide: (data) => fetchAPI('/website/slides', {
      method: 'POST',
      body: data // FormData
  }),
  deleteSlide: (id) => fetchAPI(`/website/slides/${id}`, { method: 'DELETE' }),
  updateAboutUs: (content) => fetchAPI('/website/about', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ about_us_content: content })
  }),
  updateSocialLinks: (links) => fetchAPI('/website/social', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(links)
  }),
  updateSchoolInfo: (data) => fetchAPI('/website/school-info', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
  }),

  getEvents: () => fetchAPI('/events'),
  createEvent: (data) => fetchAPI('/events', {
      method: 'POST',
      body: data // FormData
  }),
  updateEvent: (id, data) => {
      data.append('_method', 'PUT'); // For Laravel FormData PUT spoofing
      return fetchAPI(`/events/${id}`, {
          method: 'POST',
          body: data // FormData
      });
  },
  deleteEvent: (id) => fetchAPI(`/events/${id}`, { method: 'DELETE' }),

    getTimetables: (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      const endpoint = `/timetables?${params}`;
      return requestWithOfflineSupport(endpoint, {}, { cacheKey: endpoint }).then(data => ({ data: data?.data || data }));
  },
  addTimetable: (data) => fetchAPI('/timetables', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
  }),
  deleteTimetable: (id) => fetchAPI(`/timetables/${id}`, { method: 'DELETE' }),
};

export default api;
