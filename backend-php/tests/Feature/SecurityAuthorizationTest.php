<?php

namespace Tests\Feature;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SecurityAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_cannot_read_another_students_grades(): void
    {
        $student = $this->createUser('student');
        $otherStudent = $this->createUser('student');
        $classId = $this->createClass();
        $subjectId = $this->createSubject();
        $this->createStudentProfile($student->id, $classId, 'STU-001');
        $this->createStudentProfile($otherStudent->id, $classId, 'STU-002');
        DB::table('grades')->insert([
            'student_id' => $student->id,
            'subject_id' => $subjectId,
            'term' => '1st Term',
            'academic_year' => '2026/2027',
            'total_score' => 81,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($student, 'api')
            ->getJson('/api/grades?student_id='.$otherStudent->id)
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.student_id', $student->id);
    }

    public function test_student_cannot_write_grades(): void
    {
        $student = $this->createUser('student');

        $this->actingAs($student, 'api')
            ->postJson('/api/grades/save', [])
            ->assertForbidden();
    }

    public function test_teacher_cannot_read_unassigned_class_gradebook(): void
    {
        $teacher = $this->createUser('teacher');
        $classId = $this->createClass();
        $subjectId = $this->createSubject();

        $this->actingAs($teacher, 'api')
            ->getJson("/api/grades/class-subject/{$classId}/{$subjectId}?term=1st%20Term&session=2026%2F2027")
            ->assertForbidden();
    }

    public function test_assigned_teacher_cannot_write_grades_for_students_outside_the_class(): void
    {
        $teacher = $this->createUser('teacher');
        $classId = $this->createClass();
        $otherClassId = $this->createClass('Primary 1', 'primary');
        $subjectId = $this->createSubject();
        $otherStudent = $this->createUser('student');
        $this->createStudentProfile($otherStudent->id, $otherClassId, 'STU-003');
        DB::table('class_subjects')->insert([
            'class_id' => $classId,
            'subject_id' => $subjectId,
            'teacher_id' => $teacher->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($teacher, 'api')
            ->postJson('/api/grades/save', [
                'class_id' => $classId,
                'subject_id' => $subjectId,
                'term' => '1st Term',
                'academic_year' => '2026/2027',
                'grades' => [['student_id' => $otherStudent->id, 'ca1' => 10]],
            ])
            ->assertForbidden();
    }

    public function test_student_cannot_change_another_users_permissions(): void
    {
        $student = $this->createUser('student');
        $target = $this->createUser('teacher');

        $this->actingAs($student, 'api')
            ->postJson('/api/users/update-permissions', [
                'user_id' => $target->id,
                'permissions' => ['super_admin'],
            ])
            ->assertForbidden();

        $this->assertSame([], $target->fresh()->permissions ?? []);
    }

    public function test_student_cannot_update_global_settings(): void
    {
        $student = $this->createUser('student');

        $this->actingAs($student, 'api')
            ->postJson('/api/settings', ['active_term' => '3rd Term'])
            ->assertForbidden();
    }

    public function test_setting_the_active_session_creates_initial_system_settings(): void
    {
        $admin = $this->createUser('admin');
        $sessionId = DB::table('academic_sessions')->insertGetId([
            'session_name' => '2026/2027',
            'is_current' => 0,
        ]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/sessions/set-active', ['id' => $sessionId])
            ->assertOk();

        $this->assertDatabaseHas('system_settings', [
            'active_session' => '2026/2027',
            'active_term' => '1st Term',
        ]);
    }

    public function test_public_settings_do_not_expose_operational_or_report_fields(): void
    {
        SystemSetting::create([
            'active_session' => '2026/2027',
            'active_term' => '3rd Term',
            'result_entry_open' => false,
            'landing_school_name' => 'Jere Model Academy',
            'principal_signature' => 'private-signature-data',
        ]);

        $this->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('landing_school_name', 'Jere Model Academy')
            ->assertJsonMissingPath('active_session')
            ->assertJsonMissingPath('result_entry_open')
            ->assertJsonMissingPath('principal_signature');
    }

    public function test_authenticated_user_can_read_portal_settings(): void
    {
        $student = $this->createUser('student');
        SystemSetting::create([
            'active_session' => '2026/2027',
            'active_term' => '3rd Term',
            'result_entry_open' => false,
        ]);

        $this->actingAs($student, 'api')
            ->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('active_session', '2026/2027')
            ->assertJsonPath('result_entry_open', 0);
    }

    public function test_admin_can_save_two_site_attendance_geofencing_configuration(): void
    {
        $admin = $this->createUser('admin');

        $this->actingAs($admin, 'api')
            ->postJson('/api/settings', [
                'attendance_geofencing_enabled' => 1,
                'attendance_location1_name' => 'Permanent Site',
                'attendance_location1_lat' => 6.5244,
                'attendance_location1_lng' => 3.3792,
                'attendance_location2_name' => 'Temporary Site',
                'attendance_location2_lat' => 6.525,
                'attendance_location2_lng' => 3.38,
                'attendance_radius' => 250,
            ])
            ->assertOk();

        $this->assertDatabaseHas('system_settings', [
            'attendance_geofencing_enabled' => 1,
            'attendance_location1_name' => 'Permanent Site',
            'attendance_location2_name' => 'Temporary Site',
            'attendance_radius' => 250,
        ]);
    }

    public function test_admin_cannot_enable_geofencing_without_a_complete_site_location(): void
    {
        $admin = $this->createUser('admin');

        $this->actingAs($admin, 'api')
            ->postJson('/api/settings', [
                'attendance_geofencing_enabled' => 1,
                'attendance_radius' => 100,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('attendance_geofencing_enabled');
    }

    public function test_admin_can_generate_a_principal_remark_from_saved_student_performance(): void
    {
        $admin = $this->createUser('admin');
        $student = $this->createUser('student');
        $classId = $this->createClass();
        $subjectId = $this->createSubject();
        $this->createStudentProfile($student->id, $classId, 'STU-REMARK-001');
        DB::table('grades')->insert([
            'student_id' => $student->id,
            'subject_id' => $subjectId,
            'term' => '1st Term',
            'academic_year' => '2026/2027',
            'total_score' => 88,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        SystemSetting::create([
            'active_session' => '2026/2027',
            'active_term' => '1st Term',
            'remark_generation_mode' => 'ai',
        ]);
        config()->set('services.gemini.api_key', 'test-gemini-key');
        config()->set('services.gemini.model', 'gemini-3.5-flash-lite');
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => ['parts' => [['text' => 'Shows strong progress in Mathematics and should continue practising consistently.']]],
                ]],
            ], 200),
        ]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/remarks/generate-ai', [
                'student_id' => $student->id,
                'term' => '1st Term',
                'academic_year' => '2026/2027',
                'type' => 'principal',
            ])
            ->assertOk()
            ->assertJsonPath('remark.principal_remark', 'Shows strong progress in Mathematics and should continue practising consistently.');

        $subjectName = DB::table('subjects')->where('id', $subjectId)->value('name');
        Http::assertSent(function (HttpRequest $request) use ($subjectName): bool {
            return $request->hasHeader('x-goog-api-key', 'test-gemini-key')
                && str_contains($request->body(), $subjectName)
                && str_contains($request->body(), '88');
        });
        $this->assertDatabaseHas('report_card_remarks', [
            'student_id' => $student->id,
            'term' => '1st Term',
            'academic_year' => '2026/2027',
            'principal_remark' => 'Shows strong progress in Mathematics and should continue practising consistently.',
            'is_ai_generated' => 1,
        ]);
    }

    public function test_student_cannot_generate_an_ai_report_card_remark(): void
    {
        $student = $this->createUser('student');
        $classId = $this->createClass();
        $this->createStudentProfile($student->id, $classId, 'STU-REMARK-002');

        $this->actingAs($student, 'api')
            ->postJson('/api/remarks/generate-ai', [
                'student_id' => $student->id,
                'term' => '1st Term',
                'academic_year' => '2026/2027',
                'type' => 'teacher',
            ])
            ->assertForbidden();
    }

    public function test_unpublished_results_are_not_listed_or_accessible_by_students(): void
    {
        $student = $this->createUser('student');
        $classId = $this->createClass();
        $subjectId = $this->createSubject();
        $this->createStudentProfile($student->id, $classId, 'STU-UNPUBLISHED-001');
        DB::table('grades')->insert([
            'student_id' => $student->id,
            'subject_id' => $subjectId,
            'term' => '1st Term',
            'academic_year' => '2026/2027',
            'total_score' => 76,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($student, 'api')
            ->getJson('/api/student/timeline/'.$student->id)
            ->assertOk()
            ->assertJsonCount(0, 'timeline');

        $this->actingAs($student, 'api')
            ->postJson('/api/pins/verify', [
                'pin' => 'ABCD-EFGH-IJKL',
                'term' => '1st Term',
                'academic_year' => '2026/2027',
            ])
            ->assertForbidden();

        $this->actingAs($student, 'api')
            ->getJson('/api/report-card/'.$student->id.'?term=1st%20Term&year=2026%2F2027')
            ->assertForbidden()
            ->assertJsonPath('error', 'This result has not been published yet.');
    }

    public function test_admin_must_acknowledge_incomplete_results_and_can_publish_selected_students(): void
    {
        $admin = $this->createUser('admin');
        $firstStudent = $this->createUser('student');
        $secondStudent = $this->createUser('student');
        $classId = $this->createClass();
        $subjectId = $this->createSubject();
        $this->createStudentProfile($firstStudent->id, $classId, 'STU-PUBLISH-001');
        $this->createStudentProfile($secondStudent->id, $classId, 'STU-PUBLISH-002');
        DB::table('class_subjects')->insert([
            'class_id' => $classId,
            'subject_id' => $subjectId,
            'teacher_id' => $admin->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('grades')->insert([
            'student_id' => $firstStudent->id,
            'subject_id' => $subjectId,
            'term' => '1st Term',
            'academic_year' => '2026/2027',
            'total_score' => 76,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        SystemSetting::create([
            'active_session' => '2026/2027',
            'active_term' => '1st Term',
            'result_entry_open' => false,
        ]);

        $payload = [
            'term' => '1st Term',
            'academic_year' => '2026/2027',
            'scope' => 'students',
            'student_ids' => [$firstStudent->id],
        ];

        $this->actingAs($admin, 'api')
            ->postJson('/api/results/publish', $payload)
            ->assertUnprocessable()
            ->assertJsonPath('incomplete_count', 1);

        $this->actingAs($admin, 'api')
            ->postJson('/api/results/publish', $payload + ['confirm_incomplete' => true])
            ->assertOk()
            ->assertJsonPath('published_count', 1);

        $this->assertDatabaseHas('result_publications', [
            'student_id' => $firstStudent->id,
            'term' => '1st Term',
            'academic_year' => '2026/2027',
            'published_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('result_publication_events', [
            'student_id' => $firstStudent->id,
            'action' => 'published',
            'scope' => 'students',
            'performed_by' => $admin->id,
        ]);
        $this->assertDatabaseMissing('result_publications', [
            'student_id' => $secondStudent->id,
            'term' => '1st Term',
            'academic_year' => '2026/2027',
        ]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/results/unpublish', $payload)
            ->assertOk()
            ->assertJsonPath('unpublished_count', 1);

        $this->assertDatabaseMissing('result_publications', [
            'student_id' => $firstStudent->id,
            'term' => '1st Term',
            'academic_year' => '2026/2027',
        ]);
        $this->assertDatabaseHas('result_publication_events', [
            'student_id' => $firstStudent->id,
            'action' => 'unpublished',
            'scope' => 'students',
            'performed_by' => $admin->id,
        ]);
    }

    public function test_admin_cannot_publish_results_while_result_entry_is_open(): void
    {
        $admin = $this->createUser('admin');
        $student = $this->createUser('student');
        $classId = $this->createClass();
        $this->createStudentProfile($student->id, $classId, 'STU-OPEN-001');
        SystemSetting::create([
            'active_session' => '2026/2027',
            'active_term' => '1st Term',
            'result_entry_open' => true,
        ]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/results/publish', [
                'term' => '1st Term',
                'academic_year' => '2026/2027',
                'scope' => 'school',
            ])
            ->assertStatus(409);

        $this->assertDatabaseCount('result_publications', 0);
    }

    private function createUser(string $role): User
    {
        return User::create([
            'username' => strtoupper($role).'-'.bin2hex(random_bytes(4)),
            'password_hash' => bcrypt('test-password'),
            'full_name' => ucfirst($role).' Test',
            'role' => $role,
            'permissions' => [],
        ]);
    }

    private function createClass(string $name = 'JSS 1A', string $tier = 'jss'): int
    {
        return DB::table('classes')->insertGetId([
            'name' => $name.'-'.bin2hex(random_bytes(3)),
            'tier' => $tier,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createSubject(): int
    {
        return DB::table('subjects')->insertGetId([
            'name' => 'Mathematics-'.bin2hex(random_bytes(3)),
            'tier' => 'universal',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createStudentProfile(int $userId, int $classId, string $admissionNumber): void
    {
        DB::table('students')->insert([
            'id' => $userId,
            'class_id' => $classId,
            'admission_number' => $admissionNumber,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
