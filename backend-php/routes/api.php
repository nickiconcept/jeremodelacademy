<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group([
    'middleware' => ['api', 'throttle:10,1'],
    'prefix' => 'auth',
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('account-setup', [AuthController::class, 'completeAccountSetup'])->middleware('throttle:10,1');
    Route::post('account-setup/request', [AuthController::class, 'requestAccountSetup'])->middleware('throttle:5,1');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('me', [AuthController::class, 'me'])->middleware('auth:api');
    Route::post('change-password', [AuthController::class, 'changePassword'])->middleware('auth:api');
});

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FeeController;
use App\Http\Controllers\FeeInvoiceController;
use App\Http\Controllers\GradesController;
use App\Http\Controllers\PinController;
use App\Http\Controllers\RemarkController;
use App\Http\Controllers\ReportCardController;
use App\Http\Controllers\ResultPublicationController;
use App\Http\Controllers\SchemeOfWorkController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WebsiteController;

Route::get('/settings', [SettingsController::class, 'index']);
Route::get('/settings/public', [SettingsController::class, 'publicIndex']);
Route::post('/settings', [SettingsController::class, 'store'])->middleware(['auth:api', 'password.changed']);
Route::post('/settings/logo', [SettingsController::class, 'uploadLogo'])->middleware(['auth:api', 'password.changed']);
Route::post('/settings/about-image', [SettingsController::class, 'uploadAboutUsImage'])->middleware(['auth:api', 'password.changed']);

/* ================================================================
   PUBLIC WEBSITE ENDPOINTS (No Auth Required)
   ================================================================ */
Route::get('/website/public', [WebsiteController::class, 'getPublicData']);
Route::get('/website/slides', [WebsiteController::class, 'getSlides']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

Route::group(['middleware' => ['auth:api', 'password.changed', 'throttle:60,1']], function () {
    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/graduated', [StudentController::class, 'graduated']);
    Route::get('/students/averages', [StudentController::class, 'averages']);
    Route::post('/students/fast-track-graduate', [StudentController::class, 'fastTrackGraduate']);
    Route::post('/students/promote-bulk', [StudentController::class, 'promoteBulk']);
    Route::post('/students/promote-individual', [StudentController::class, 'promoteIndividual']);
    Route::post('/students/bulk-status-update', [StudentController::class, 'bulkStatusUpdate']);
    Route::post('/students/bulk-class-update', [StudentController::class, 'bulkClassUpdate']);
    Route::get('/promoted-classes', [StudentController::class, 'promotedClasses']);
    Route::post('/promoted-classes/reset', [StudentController::class, 'resetPromotedClasses']);
    Route::get('/students/{id}', [StudentController::class, 'show']);
    Route::post('/users/register-student', [StudentController::class, 'store']);
    Route::post('/users/register-teacher', [UserController::class, 'registerTeacher']);
    Route::put('/users/update-teacher/{id}', [UserController::class, 'updateTeacher']);
    Route::post('/users/update-status', [UserController::class, 'updateStatus']);
    Route::post('/users/update-permissions', [UserController::class, 'updatePermissions']);

    // Admin Management Routes (Protected by super_admin check in controller)
    Route::get('/admins', [AdminController::class, 'index']);
    Route::post('/admins/register', [AdminController::class, 'register']);
    Route::post('/admins/elevate', [AdminController::class, 'elevate']);
    Route::put('/admins/update/{id}', [AdminController::class, 'update']);
    Route::delete('/admins/delete/{id}', [AdminController::class, 'destroy']);

    Route::put('/users/update-student/{id}', [StudentController::class, 'update']);
    Route::delete('/users/delete-student/{id}', [StudentController::class, 'destroy']);
    Route::post('/students/transition', [StudentController::class, 'transition']);

    // Classes
    Route::get('/classes', [ClassController::class, 'index']);
    Route::get('/waiting-rooms', [ClassController::class, 'waitingRooms']);
    Route::get('/classes/{id}', [ClassController::class, 'show']);
    Route::post('/classes', [ClassController::class, 'store']);
    Route::post('/classes/assign-form-master', [ClassController::class, 'assignFormMaster']);
    Route::put('/classes/{id}', [ClassController::class, 'update']);
    Route::delete('/classes/{id}', [ClassController::class, 'destroy']);

    // Subjects
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{id}', [SubjectController::class, 'show']);
    Route::post('/subjects', [SubjectController::class, 'store']);
    Route::put('/subjects/{id}', [SubjectController::class, 'update']);
    Route::delete('/subjects/{id}', [SubjectController::class, 'destroy']);
    Route::post('/class-subjects/assign', [SubjectController::class, 'assign']);
    Route::post('/class-subjects/sync-class', [SubjectController::class, 'syncForClass']);
    Route::post('/class-subjects/sync-tier', [SubjectController::class, 'syncForTier']);
    Route::get('/tier-subjects/{tier}', [SubjectController::class, 'getTierSubjects']);

    // Teachers
    Route::get('/teachers', [TeacherController::class, 'index']);
    Route::get('/teacher/assignments', [TeacherController::class, 'assignments']);
    Route::get('/teachers/{id}', [TeacherController::class, 'show']);
    Route::post('/teachers', [TeacherController::class, 'store']);
    Route::put('/teachers/{id}', [TeacherController::class, 'update']);
    Route::delete('/teachers/{id}', [TeacherController::class, 'destroy']);

    // Attendance
    Route::get('/attendance/student/{studentId}', [AttendanceController::class, 'studentAttendance']);
    Route::get('/attendance/report/{classId}', [AttendanceController::class, 'classReport']);
    Route::get('/attendance/{classId}/{date}', [AttendanceController::class, 'classRoster']);
    Route::post('/attendance/save', [AttendanceController::class, 'saveAttendance']);

    // Report Cards
    Route::get('/report-card/{studentId}', [ReportCardController::class, 'getReportCard']);
    Route::get('/report-cards/bulk', [ReportCardController::class, 'getBulkReportCards']);
    Route::get('/report-card/bulk', [ReportCardController::class, 'getBulkReportCards']);
    Route::get('/broadsheet/{classId}', [ReportCardController::class, 'getBroadsheet']);
    Route::get('/teacher/result-progress', [ReportCardController::class, 'teacherResultProgress']);
    Route::get('/admin/result-progress', [ReportCardController::class, 'adminResultProgress']);
    Route::get('/student/timeline/{studentId}', [ReportCardController::class, 'studentTimeline']);

    // Result publication
    Route::get('/results/publication-candidates', [ResultPublicationController::class, 'candidates']);
    Route::post('/results/publish', [ResultPublicationController::class, 'publish']);
    Route::post('/results/unpublish', [ResultPublicationController::class, 'unpublish']);

    // Remarks
    Route::get('/remarks/{studentId}', [RemarkController::class, 'getRemark']);
    Route::post('/remarks/save', [RemarkController::class, 'saveRemark']);
    Route::post('/remarks/generate-ai', [RemarkController::class, 'generateAIRemark']);

    // Skills & Evaluation
    Route::get('/skills', [SkillController::class, 'getSkills']);
    Route::post('/skills', [SkillController::class, 'addSkill']);
    Route::put('/skills/{id}', [SkillController::class, 'updateSkill']);
    Route::delete('/skills/{id}', [SkillController::class, 'deleteSkill']);
    Route::get('/skills/students/{classId}', [SkillController::class, 'getStudents']);
    Route::get('/skills/evaluations/{studentId}', [SkillController::class, 'getEvaluations']);
    Route::post('/skills/evaluate', [SkillController::class, 'saveEvaluation']);
    Route::get('/behavioral/{studentId}', [SkillController::class, 'getBehavioral']);
    Route::post('/behavioral/save', [SkillController::class, 'saveBehavioral']);

    // Grades
    Route::get('/grades/class-subject/{classId}/{subjectId}', [GradesController::class, 'getGradesForEntry']);
    Route::get('/grades', [GradesController::class, 'getStudentGrades']);
    Route::post('/grades/save', [GradesController::class, 'saveGrades']);

    // Financials
    Route::post('/fees/generate-termly', [FeeController::class, 'generateTermly']);
    Route::post('/fees/add', [FeeController::class, 'addCustomInvoice']);
    Route::post('/fees/pay', [FeeController::class, 'payFee']);
    Route::get('/fees/student/{studentId}', [FeeController::class, 'getStudentFees']);
    Route::get('/fees/structures', [FeeController::class, 'getStructures']);
    Route::post('/fees/structures', [FeeController::class, 'createStructure']);
    Route::put('/fees/structures/{id}', [FeeController::class, 'updateStructure']);
    Route::delete('/fees/structures/{id}', [FeeController::class, 'deleteStructure']);
    Route::get('/fees/report', [FeeController::class, 'getReport']);
    Route::get('/receipts/bulk', [FeeController::class, 'getBulkReceipts']);
    Route::get('/fees/custom-invoices', [FeeController::class, 'getCustomInvoices']);
    Route::post('/fees/custom-invoices-group/delete', [FeeController::class, 'deleteCustomInvoiceGroup']);
    Route::post('/fees/custom-invoices-group/update', [FeeController::class, 'updateCustomInvoiceGroup']);

    // System Settings & Sessions
    Route::get('/sessions', [SystemController::class, 'getSessions']);
    Route::post('/sessions', [SystemController::class, 'createSession']);
    Route::post('/sessions/set-active', [SystemController::class, 'setActiveSession']);

    // Schemes of Work
    Route::get('/schemes', [SchemeOfWorkController::class, 'index']);
    Route::post('/schemes', [SchemeOfWorkController::class, 'store']);
    Route::delete('/schemes/{id}', [SchemeOfWorkController::class, 'destroy']);
    Route::post('/sow/mark-treated', [SchemeOfWorkController::class, 'markTreated']);
    Route::get('/sow/student', [SchemeOfWorkController::class, 'studentIndex']);
    Route::get('/sow/admin-overview', [SchemeOfWorkController::class, 'adminProgressOverview']);

    // PINs & Security
    Route::get('/pins', [PinController::class, 'getPins']);
    Route::post('/pins/generate', [PinController::class, 'generatePins']);
    Route::post('/pins/verify', [PinController::class, 'verifyPin'])->middleware('throttle:10,1');

    // Catch-all MVP stub just in case
    // Class-subject-teacher assignments with all names resolved
    Route::get('/class-subjects', [SubjectController::class, 'classSubjects']);

    Route::get('/fee-invoices', [FeeInvoiceController::class, 'index']);
    Route::post('/fee-invoices', [FeeInvoiceController::class, 'store']);
    Route::put('/fee-invoices/{id}', [FeeInvoiceController::class, 'update']);
    Route::post('/fee-invoices/{id}/pay', [FeeInvoiceController::class, 'recordPayment']);
    Route::delete('/fee-invoices/{id}', [FeeInvoiceController::class, 'destroy']);

    /* ================================================================
       ACTIVITY LOGS
       ================================================================ */
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/stats', [ActivityLogController::class, 'stats']);
    Route::delete('/activity-logs/purge', [ActivityLogController::class, 'purge']);

    /* ================================================================
       WEBSITE MANAGEMENT & TIMETABLE (Admin Only)
       ================================================================ */
    Route::post('/website/slides', [WebsiteController::class, 'storeSlide']);
    Route::delete('/website/slides/{id}', [WebsiteController::class, 'deleteSlide']);
    Route::post('/website/about', [WebsiteController::class, 'updateAboutUs']);
    Route::post('/website/social', [WebsiteController::class, 'updateSocialLinks']);
    Route::post('/website/school-info', [WebsiteController::class, 'updateSchoolInfo']);

    Route::apiResource('events', EventController::class)->except(['index', 'show']);

    Route::get('/timetables', [TimetableController::class, 'index']);
    Route::post('/timetables', [TimetableController::class, 'store']);
    Route::delete('/timetables/{id}', [TimetableController::class, 'destroy']);
});
