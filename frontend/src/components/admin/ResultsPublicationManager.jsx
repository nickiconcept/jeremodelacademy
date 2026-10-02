import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Clock3, Send } from 'lucide-react';
import api from '../../utils/api';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

const TERMS = ['1st Term', '2nd Term', '3rd Term'];

const needsReview = (student) => student.graded_subjects === 0
  || student.missing_subjects > 0
  || !student.has_class_teacher_remark
  || !student.has_principal_remark;

export default function ResultsPublicationManager({ classes, sessions, currentTerm, currentSession }) {
  const { confirm, showToast } = useGlobalUI();
  const [term, setTerm] = useState(currentTerm || '1st Term');
  const [academicYear, setAcademicYear] = useState(currentSession || sessions[0]?.session_name || '');
  const [scope, setScope] = useState('school');
  const [classId, setClassId] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [history, setHistory] = useState([]);
  const [resultEntryOpen, setResultEntryOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!academicYear && sessions.length > 0) {
      setAcademicYear(sessions[0].session_name);
    }
  }, [academicYear, sessions]);

  useEffect(() => {
    let isCurrentRequest = true;
    setLoading(true);
    setError('');

    api.getResultPublicationCandidates(term, academicYear)
      .then((data) => {
        if (!isCurrentRequest) return;
        setCandidates(data.candidates || []);
        setHistory(data.history || []);
        setResultEntryOpen(Boolean(data.result_entry_open));
      })
      .catch((requestError) => {
        if (isCurrentRequest) setError(requestError.message || 'Could not load result publication status.');
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });

    return () => { isCurrentRequest = false; };
  }, [term, academicYear, refreshKey]);

  useEffect(() => {
    setSelectedStudentIds([]);
    setConfirmIncomplete(false);
  }, [term, academicYear, scope, classId, studentClassFilter]);

  const selectedClassName = classes.find((schoolClass) => String(schoolClass.id) === String(classId))?.name;
  const visibleCandidates = useMemo(() => {
    if (scope === 'class') {
      return candidates.filter((student) => String(student.class_id) === String(classId));
    }
    if (scope === 'students' && studentClassFilter) {
      return candidates.filter((student) => String(student.class_id) === String(studentClassFilter));
    }
    return candidates;
  }, [candidates, scope, classId, studentClassFilter]);

  const targetCandidates = scope === 'school'
    ? candidates
    : scope === 'class'
      ? visibleCandidates
      : candidates.filter((student) => selectedStudentIds.includes(String(student.id)));
  const incompleteCount = targetCandidates.filter(needsReview).length;
  const publishedCount = targetCandidates.filter((student) => student.is_published).length;
  const allVisibleSelected = visibleCandidates.length > 0
    && visibleCandidates.every((student) => selectedStudentIds.includes(String(student.id)));

  const toggleVisibleStudents = () => {
    const visibleIds = visibleCandidates.map((student) => String(student.id));
    setSelectedStudentIds((current) => allVisibleSelected
      ? current.filter((studentId) => !visibleIds.includes(studentId))
      : [...new Set([...current, ...visibleIds])]);
  };

  const toggleStudent = (studentId) => {
    const normalizedId = String(studentId);
    setSelectedStudentIds((current) => current.includes(normalizedId)
      ? current.filter((id) => id !== normalizedId)
      : [...current, normalizedId]);
  };

  const handlePublish = async () => {
    if (targetCandidates.length === 0 || resultEntryOpen || (incompleteCount > 0 && !confirmIncomplete)) return;

    const accepted = await confirm({
      title: 'Publish student results?',
      message: `This will make ${targetCandidates.length} ${targetCandidates.length === 1 ? 'student result' : 'student results'} for ${term}, ${academicYear} visible in student portals. The result-checker PIN requirement will remain in place.${incompleteCount > 0 ? ` ${incompleteCount} selected ${incompleteCount === 1 ? 'student has' : 'students have'} incomplete marks or remarks.` : ''}`,
      confirmText: 'Publish Results',
      type: 'primary',
    });
    if (!accepted) return;

    setPublishing(true);
    setError('');
    try {
      const publicationData = {
        term,
        academic_year: academicYear,
        scope,
        confirm_incomplete: confirmIncomplete,
      };
      if (scope === 'class') publicationData.class_id = classId;
      if (scope === 'students') publicationData.student_ids = selectedStudentIds;

      const result = await api.publishResults(publicationData);
      showToast(`${result.published_count} student results published.`, 'success');
      setConfirmIncomplete(false);
      setRefreshKey((value) => value + 1);
    } catch (publishError) {
      setError(publishError.message || 'Could not publish these results.');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (publishedCount === 0) return;
    const accepted = await confirm({
      title: 'Unpublish these results?',
      message: `${publishedCount} student results will be hidden from student portals. Their result-checker PIN records will not be removed.`,
      confirmText: 'Unpublish Results',
      type: 'danger',
    });
    if (!accepted) return;

    setPublishing(true);
    setError('');
    try {
      const publicationData = { term, academic_year: academicYear, scope };
      if (scope === 'class') publicationData.class_id = classId;
      if (scope === 'students') publicationData.student_ids = targetCandidates.map((student) => student.id);
      const result = await api.unpublishResults(publicationData);
      showToast(`${result.unpublished_count} student results unpublished.`, 'success');
      setSelectedStudentIds([]);
      setRefreshKey((value) => value + 1);
    } catch (unpublishError) {
      setError(unpublishError.message || 'Could not unpublish these results.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="glass-panel results-publication" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
      <header className="results-publication__hero">
        <div>
          <p className="results-publication__eyebrow">RESULT RELEASE</p>
          <h2>Publish Results</h2>
          <p>Choose who can see this term’s results. Students will still need a valid result-checker PIN.</p>
        </div>
        <Send size={24} aria-hidden="true" />
      </header>

      <div className="results-publication__filters">
        <label className="form-group">
          <span>Term</span>
          <select className="form-control" value={term} onChange={(event) => setTerm(event.target.value)}>
            {TERMS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="form-group">
          <span>Academic session</span>
          <select className="form-control" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)}>
            {sessions.map((session) => (
              <option key={session.session_name} value={session.session_name}>{session.session_name}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="results-publication__scopes">
        <legend>Who should receive results?</legend>
        {[
          ['school', 'Whole school'],
          ['class', 'One class'],
          ['students', 'Selected students'],
        ].map(([value, label]) => (
          <label key={value} className={`results-publication__scope ${scope === value ? 'is-selected' : ''}`}>
            <input type="radio" name="result-publication-scope" value={value} checked={scope === value} onChange={() => setScope(value)} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      {scope === 'class' && (
        <label className="form-group results-publication__class-select">
          <span>Class</span>
          <select className="form-control" value={classId} onChange={(event) => setClassId(event.target.value)}>
            <option value="">Select a class</option>
            {classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>
            ))}
          </select>
        </label>
      )}

      {scope === 'students' && (
        <div className="results-publication__student-filter">
          <label className="form-group">
            <span>Filter by class</span>
            <select className="form-control" value={studentClassFilter} onChange={(event) => setStudentClassFilter(event.target.value)}>
              <option value="">All classes</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn-secondary" onClick={toggleVisibleStudents} disabled={visibleCandidates.length === 0}>
            {allVisibleSelected ? 'Clear visible students' : 'Select all visible students'}
          </button>
        </div>
      )}

      {resultEntryOpen && (
        <div className="alert alert-warning results-publication__notice">
          <AlertTriangle size={18} /> Close teacher result entry in Settings before publishing this session.
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="results-publication__summary" aria-live="polite">
        <div><strong>{loading ? '...' : targetCandidates.length}</strong><span>Selected</span></div>
        <div><strong>{loading ? '...' : incompleteCount}</strong><span>Need review</span></div>
        <div><strong>{loading ? '...' : publishedCount}</strong><span>Already published</span></div>
      </div>

      <div className="table-container results-publication__table">
        <table className="school-table">
          <thead>
            <tr>
              {scope === 'students' && (
                <th>
                  <input type="checkbox" aria-label="Select all visible students" checked={allVisibleSelected} onChange={toggleVisibleStudents} />
                </th>
              )}
              <th>Student</th>
              <th>Class</th>
              <th>Grades</th>
              <th>Remarks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={scope === 'students' ? 6 : 5}>Loading result readiness...</td></tr>
            ) : visibleCandidates.length === 0 ? (
              <tr><td colSpan={scope === 'students' ? 6 : 5}>No active students found for this selection.</td></tr>
            ) : visibleCandidates.map((student) => {
              const isSelected = selectedStudentIds.includes(String(student.id));
              const incomplete = needsReview(student);
              return (
                <tr key={student.id}>
                  {scope === 'students' && (
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${student.full_name}`}
                        checked={isSelected}
                        onChange={() => toggleStudent(student.id)}
                      />
                    </td>
                  )}
                  <td>
                    <strong>{student.full_name}</strong>
                    <small className="results-publication__admission">{student.admission_number || 'No admission number'}</small>
                  </td>
                  <td>{student.class_name || 'Unassigned'}</td>
                  <td>{student.graded_subjects}/{student.assigned_subjects}{student.missing_subjects > 0 ? ` (${student.missing_subjects} missing)` : ''}</td>
                  <td>{student.has_class_teacher_remark ? 'Form master ✓' : 'Form master missing'}<br />{student.has_principal_remark ? 'Principal ✓' : 'Principal missing'}</td>
                  <td>
                    {student.is_published
                      ? <><span className="badge badge-success"><Check size={13} /> Published</span><small className="results-publication__admission">By {student.published_by_name || 'Admin'}</small></>
                      : incomplete
                        ? <span className="badge badge-warning"><AlertTriangle size={13} /> Review</span>
                        : <span className="badge badge-secondary"><Clock3 size={13} /> Ready</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {incompleteCount > 0 && targetCandidates.length > 0 && (
        <label className="results-publication__acknowledge">
          <input type="checkbox" checked={confirmIncomplete} onChange={(event) => setConfirmIncomplete(event.target.checked)} />
          I have reviewed the missing marks or remarks and still want to publish these results.
        </label>
      )}

      <div className="results-publication__actions">
        <span>{scope === 'class' && selectedClassName ? selectedClassName : 'Publication scope'} · {term} · {academicYear}</span>
        <div className="results-publication__action-buttons">
          {publishedCount > 0 && (
            <button type="button" className="btn btn-secondary" onClick={handleUnpublish} disabled={publishing}>
              Unpublish {publishedCount}
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePublish}
            disabled={loading || publishing || resultEntryOpen || targetCandidates.length === 0 || (scope === 'class' && !classId) || (incompleteCount > 0 && !confirmIncomplete)}
          >
            <Send size={16} /> {publishing ? 'Publishing...' : `Publish ${targetCandidates.length} ${targetCandidates.length === 1 ? 'result' : 'results'}`}
          </button>
        </div>
      </div>

      <details className="results-publication__history">
        <summary>Publication activity ({history.length})</summary>
        {history.length === 0 ? <p>No publish activity recorded for this term.</p> : (
          <div className="table-container">
            <table className="school-table">
              <thead><tr><th>Action</th><th>Student</th><th>Scope</th><th>By</th><th>Time</th></tr></thead>
              <tbody>
                {history.map((event, index) => (
                  <tr key={`${event.performed_at}-${event.student_name}-${index}`}>
                    <td>{event.action}</td>
                    <td>{event.student_name} ({event.admission_number || 'No ID'})</td>
                    <td>{event.scope === 'class' ? event.class_name : event.scope}</td>
                    <td>{event.performed_by_name || 'Unknown'}</td>
                    <td>{new Date(event.performed_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>
    </section>
  );
}