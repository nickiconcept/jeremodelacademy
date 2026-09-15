<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group([
    'middleware' => ['api', 'throttle:60,1'],
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('me', [AuthController::class, 'me']);
});



use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StudentController;

Route::get('/settings', [SettingsController::class, 'index']);
Route::post('/settings', [SettingsController::class, 'store'])->middleware('auth:api');

Route::group(['middleware' => ['auth:api', 'throttle:60,1']], function () {
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
    Route::post('/users/register-teacher', [App\Http\Controllers\UserController::class, 'registerTeacher']);
    Route::put('/users/update-teacher/{id}', [App\Http\Controllers\UserController::class, 'updateTeacher']);
    Route::post('/users/update-status', [App\Http\Controllers\UserController::class, 'updateStatus']);
    Route::put('/users/update-student/{id}', [StudentController::class, 'update']);
    Route::delete('/users/delete-student/{id}', [StudentController::class, 'destroy']);
    Route::post('/students/transition', [StudentController::class, 'transition']);

    // Classes
    Route::get('/classes', [\App\Http\Controllers\ClassController::class, 'index']);
    Route::get('/waiting-rooms', [\App\Http\Controllers\ClassController::class, 'waitingRooms']);
    Route::get('/classes/{id}', [\App\Http\Controllers\ClassController::class, 'show']);
    Route::post('/classes', [\App\Http\Controllers\ClassController::class, 'store']);
    Route::post('/classes/assign-form-master', [\App\Http\Controllers\ClassController::class, 'assignFormMaster']);
    Route::put('/classes/{id}', [\App\Http\Controllers\ClassController::class, 'update']);
    Route::delete('/classes/{id}', [\App\Http\Controllers\ClassController::class, 'destroy']);

    // Subjects
    Route::get('/subjects', [\App\Http\Controllers\SubjectController::class, 'index']);
    Route::get('/subjects/{id}', [\App\Http\Controllers\SubjectController::class, 'show']);
    Route::post('/subjects', [\App\Http\Controllers\SubjectController::class, 'store']);
    Route::put('/subjects/{id}', [\App\Http\Controllers\SubjectController::class, 'update']);
    Route::delete('/subjects/{id}', [\App\Http\Controllers\SubjectController::class, 'destroy']);
    Route::post('/class-subjects/assign', [\App\Http\Controllers\SubjectController::class, 'assign']);

    // Teachers
    Route::get('/teachers', [\App\Http\Controllers\TeacherController::class, 'index']);
    Route::get('/teacher/assignments', [\App\Http\Controllers\TeacherController::class, 'assignments']);
    Route::get('/teachers/{id}', [\App\Http\Controllers\TeacherController::class, 'show']);
    Route::post('/teachers', [\App\Http\Controllers\TeacherController::class, 'store']);
    Route::put('/teachers/{id}', [\App\Http\Controllers\TeacherController::class, 'update']);
    Route::delete('/teachers/{id}', [\App\Http\Controllers\TeacherController::class, 'destroy']);

    // Attendance
    Route::get('/attendance/student/{studentId}', [\App\Http\Controllers\AttendanceController::class, 'studentAttendance']);
    Route::get('/attendance/report/{classId}', [\App\Http\Controllers\AttendanceController::class, 'classReport']);
    Route::get('/attendance/{classId}/{date}', [\App\Http\Controllers\AttendanceController::class, 'classRoster']);
    Route::post('/attendance/save', [\App\Http\Controllers\AttendanceController::class, 'saveAttendance']);
    
    // Report Cards
    Route::get('/report-card/{studentId}', [\App\Http\Controllers\ReportCardController::class, 'getReportCard']);
    Route::get('/report-cards/bulk', [\App\Http\Controllers\ReportCardController::class, 'getBulkReportCards']);
    Route::get('/report-card/bulk', [\App\Http\Controllers\ReportCardController::class, 'getBulkReportCards']);
    Route::get('/broadsheet/{classId}', [\App\Http\Controllers\ReportCardController::class, 'getBroadsheet']);
    Route::get('/teacher/result-progress', [\App\Http\Controllers\ReportCardController::class, 'teacherResultProgress']);
    Route::get('/admin/result-progress', [\App\Http\Controllers\ReportCardController::class, 'adminResultProgress']);
    Route::get('/student/timeline/{studentId}', [\App\Http\Controllers\ReportCardController::class, 'studentTimeline']);

    // Remarks
    Route::get('/remarks/{studentId}', [\App\Http\Controllers\RemarkController::class, 'getRemark']);
    Route::post('/remarks/save', [\App\Http\Controllers\RemarkController::class, 'saveRemark']);
    Route::post('/remarks/generate-ai', [\App\Http\Controllers\RemarkController::class, 'generateAIRemark']);

    // Skills & Evaluation
    Route::get('/skills', [\App\Http\Controllers\SkillController::class, 'getSkills']);
    Route::post('/skills', [\App\Http\Controllers\SkillController::class, 'addSkill']);
    Route::put('/skills/{id}', [\App\Http\Controllers\SkillController::class, 'updateSkill']);
    Route::delete('/skills/{id}', [\App\Http\Controllers\SkillController::class, 'deleteSkill']);
    Route::get('/skills/students/{classId}', [\App\Http\Controllers\SkillController::class, 'getStudents']);
    Route::get('/skills/evaluations/{studentId}', [\App\Http\Controllers\SkillController::class, 'getEvaluations']);
    Route::post('/skills/evaluate', [\App\Http\Controllers\SkillController::class, 'saveEvaluation']);
    Route::get('/behavioral/{studentId}', [\App\Http\Controllers\SkillController::class, 'getBehavioral']);
    Route::post('/behavioral/save', [\App\Http\Controllers\SkillController::class, 'saveBehavioral']);

    // Grades
    Route::get('/grades/class-subject/{classId}/{subjectId}', [\App\Http\Controllers\GradesController::class, 'getGradesForEntry']);
    Route::get('/grades', [\App\Http\Controllers\GradesController::class, 'getStudentGrades']);
    Route::post('/grades/save', [\App\Http\Controllers\GradesController::class, 'saveGrades']);

    // Financials
    Route::post('/fees/generate-termly', [\App\Http\Controllers\FeeController::class, 'generateTermly']);
    Route::post('/fees/add', [\App\Http\Controllers\FeeController::class, 'addCustomInvoice']);
    Route::post('/fees/pay', [\App\Http\Controllers\FeeController::class, 'payFee']);
    Route::get('/fees/student/{studentId}', [\App\Http\Controllers\FeeController::class, 'getStudentFees']);
    Route::get('/fees/structures', [\App\Http\Controllers\FeeController::class, 'getStructures']);
    Route::post('/fees/structures', [\App\Http\Controllers\FeeController::class, 'createStructure']);
    Route::put('/fees/structures/{id}', [\App\Http\Controllers\FeeController::class, 'updateStructure']);
    Route::delete('/fees/structures/{id}', [\App\Http\Controllers\FeeController::class, 'deleteStructure']);
    Route::get('/fees/report', [\App\Http\Controllers\FeeController::class, 'getReport']);
    Route::get('/receipts/bulk', [\App\Http\Controllers\FeeController::class, 'getBulkReceipts']);
    Route::get('/fees/custom-invoices', [\App\Http\Controllers\FeeController::class, 'getCustomInvoices']);
    Route::post('/fees/custom-invoices-group/delete', [\App\Http\Controllers\FeeController::class, 'deleteCustomInvoiceGroup']);
    Route::post('/fees/custom-invoices-group/update', [\App\Http\Controllers\FeeController::class, 'updateCustomInvoiceGroup']);

    // System Settings & Sessions
    Route::get('/sessions', [\App\Http\Controllers\SystemController::class, 'getSessions']);
    Route::post('/sessions', [\App\Http\Controllers\SystemController::class, 'createSession']);
    Route::post('/sessions/set-active', [\App\Http\Controllers\SystemController::class, 'setActiveSession']);

    // Schemes of Work
    Route::get('/schemes', [\App\Http\Controllers\SchemeOfWorkController::class, 'index']);
    Route::post('/schemes', [\App\Http\Controllers\SchemeOfWorkController::class, 'store']);
    Route::delete('/schemes/{id}', [\App\Http\Controllers\SchemeOfWorkController::class, 'destroy']);
    Route::post('/sow/mark-treated', [\App\Http\Controllers\SchemeOfWorkController::class, 'markTreated']);
    Route::get('/sow/student', [\App\Http\Controllers\SchemeOfWorkController::class, 'studentIndex']);
    Route::get('/sow/admin-overview', [\App\Http\Controllers\SchemeOfWorkController::class, 'adminProgressOverview']);

    // PINs & Security
    Route::get('/pins', [\App\Http\Controllers\PinController::class, 'getPins']);
    Route::post('/pins/generate', [\App\Http\Controllers\PinController::class, 'generatePins']);
    Route::post('/pins/verify', [\App\Http\Controllers\PinController::class, 'verifyPin']);

    // Catch-all MVP stub just in case
    // Class-subject-teacher assignments with all names resolved
    Route::get('/class-subjects', [\App\Http\Controllers\SubjectController::class, 'classSubjects']);

    Route::get('/fee-invoices', [\App\Http\Controllers\FeeInvoiceController::class, 'index']);
    Route::post('/fee-invoices', [\App\Http\Controllers\FeeInvoiceController::class, 'store']);
    Route::put('/fee-invoices/{id}', [\App\Http\Controllers\FeeInvoiceController::class, 'update']);
    Route::post('/fee-invoices/{id}/pay', [\App\Http\Controllers\FeeInvoiceController::class, 'recordPayment']);
    Route::delete('/fee-invoices/{id}', [\App\Http\Controllers\FeeInvoiceController::class, 'destroy']);

    /* ================================================================
       ACTIVITY LOGS
       ================================================================ */
    Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index']);
    Route::get('/activity-logs/stats', [\App\Http\Controllers\ActivityLogController::class, 'stats']);
    Route::delete('/activity-logs/purge', [\App\Http\Controllers\ActivityLogController::class, 'purge']);
});

