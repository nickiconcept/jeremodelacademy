<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_roster_loads_students_before_any_attendance_has_been_saved(): void
    {
        [$admin, $classId, $student] = $this->createRoster();

        $this->actingAs($admin, 'api')->getJson("/api/attendance/{$classId}/2026-10-13")
            ->assertOk()->assertJsonCount(1)->assertJsonPath('0.student_id', $student->id)
            ->assertJsonPath('0.status', null);
    }

    public function test_saved_attendance_is_returned_in_the_roster_and_updated_without_duplicates(): void
    {
        [$admin, $classId, $student] = $this->createRoster();
        $payload = ['class_id' => $classId, 'date' => '2026-10-13', 'records' => [['student_id' => $student->id, 'status' => 'present']]];
        $this->actingAs($admin, 'api')->postJson('/api/attendance/save', $payload)->assertOk();
        $this->getJson("/api/attendance/{$classId}/2026-10-13")->assertOk()->assertJsonPath('0.status', 'present');
        $payload['records'][0]['status'] = 'late';
        $this->postJson('/api/attendance/save', $payload)->assertOk();
        $this->getJson("/api/attendance/{$classId}/2026-10-13")->assertOk()->assertJsonPath('0.status', 'late');
        $this->assertDatabaseCount('attendance', 1);
        $this->assertDatabaseHas('attendance', ['student_id' => $student->id, 'marked_by' => $admin->id]);
    }

    public function test_migration_does_not_replace_an_existing_attendance_table(): void
    {
        [$admin, $classId, $student] = $this->createRoster();
        DB::table('attendance')->insert(['student_id' => $student->id, 'date' => '2026-10-13', 'status' => 'present', 'marked_by' => $admin->id]);
        $migration = require database_path('migrations/2026_10_13_122546_create_attendance_table.php');
        $migration->up();
        $migration->down();
        $this->assertTrue(Schema::hasTable('attendance'));
        $this->assertDatabaseHas('attendance', ['student_id' => $student->id, 'status' => 'present']);
    }

    public function test_unassigned_teacher_receives_forbidden_instead_of_an_internal_server_error(): void
    {
        [$admin, $classId, $student] = $this->createRoster();
        $teacher = $this->createUser('teacher');
        DB::table('teachers')->insert(['id' => $teacher->id, 'signature' => 'saved-signature']);
        $this->actingAs($teacher, 'api')->getJson("/api/attendance/{$classId}/2026-10-13")->assertForbidden();
        $this->getJson("/api/attendance/report/{$classId}")->assertForbidden();
    }

    public function test_assigned_form_master_can_load_the_roster(): void
    {
        [$admin, $classId, $student] = $this->createRoster();
        $teacher = $this->createUser('teacher');
        DB::table('teachers')->insert(['id' => $teacher->id, 'signature' => 'saved-signature']);
        DB::table('classes')->where('id', $classId)->update(['form_master_id' => $teacher->id]);
        $this->actingAs($teacher, 'api')->getJson("/api/attendance/{$classId}/2026-10-13")
            ->assertOk()->assertJsonCount(1)->assertJsonPath('0.student_id', $student->id);
    }

    private function createRoster(): array
    {
        $admin = $this->createUser('admin');
        $classId = DB::table('classes')->insertGetId(['name' => 'JSS 1A', 'tier' => 'jss']);
        $student = $this->createUser('student');
        DB::table('students')->insert(['id' => $student->id, 'class_id' => $classId, 'admission_number' => 'ATT-001', 'status' => 'active']);

        return [$admin, $classId, $student];
    }

    private function createUser(string $role): User
    {
        return User::create(['username' => $role.'-'.bin2hex(random_bytes(4)), 'password_hash' => bcrypt('test-password'), 'full_name' => ucfirst($role).' Test', 'role' => $role, 'permissions' => []]);
    }
}
