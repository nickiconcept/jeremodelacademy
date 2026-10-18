<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class StudentLifecycleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $admin = User::create(['username' => 'lifecycle-admin', 'password_hash' => bcrypt('password'), 'full_name' => 'Admin', 'role' => 'admin', 'permissions' => []]);
        $this->actingAs($admin, 'api');
    }

    public function test_deleting_earlier_and_latest_students_does_not_reuse_generated_numbers(): void
    {
        $first = $this->postJson('/api/users/register-student', ['full_name' => 'First'])->assertCreated();
        $second = $this->postJson('/api/users/register-student', ['full_name' => 'Second'])->assertCreated();
        $this->deleteJson('/api/users/delete-student/'.$first->json('studentId'))->assertOk();
        $third = $this->postJson('/api/users/register-student', ['full_name' => 'First'])->assertCreated();
        $this->assertNotEquals($second->json('admission_number'), $third->json('admission_number'));
        $this->deleteJson('/api/users/delete-student/'.$third->json('studentId'))->assertOk();
        $fourth = $this->postJson('/api/users/register-student', ['full_name' => 'Fourth'])->assertCreated();
        $this->assertStringEndsWith('/0004', $fourth->json('admission_number'));
    }

    public function test_custom_numbers_are_checked_and_advance_the_sequence(): void
    {
        $number = 'JMA/'.date('Y').'/9000';
        $this->postJson('/api/users/register-student', ['full_name' => 'Custom', 'custom_admission_number' => strtolower($number)])->assertCreated();
        $this->postJson('/api/users/register-student', ['full_name' => 'Duplicate', 'custom_admission_number' => $number])->assertStatus(400)->assertJsonPath('error', 'This admission number is already in use. Enter a different number or leave it blank to generate one.');
        $next = $this->postJson('/api/users/register-student', ['full_name' => 'Automatic'])->assertCreated();
        $this->assertStringEndsWith('/9001', $next->json('admission_number'));
    }

    public function test_migration_starts_above_existing_student_numbers_and_usernames(): void
    {
        $this->postJson('/api/users/register-student', ['full_name' => 'Existing', 'custom_admission_number' => 'JMA/2025/0400'])->assertCreated();
        User::create(['username' => 'JMA/2026/0600', 'password_hash' => bcrypt('password'), 'full_name' => 'Reserved', 'role' => 'student']);
        $migration = require database_path('migrations/2026_10_18_171220_create_student_admission_sequence_table.php');
        $migration->down();
        $migration->up();
        $next = $this->postJson('/api/users/register-student', ['full_name' => 'New'])->assertCreated();
        $this->assertStringEndsWith('/0601', $next->json('admission_number'));
    }

    public function test_class_change_preserves_account_profile_and_linked_records(): void
    {
        $oldClass = DB::table('classes')->insertGetId(['name' => 'Primary 4', 'tier' => 'primary']);
        $newClass = DB::table('classes')->insertGetId(['name' => 'Primary 5', 'tier' => 'primary']);
        $response = $this->postJson('/api/users/register-student', ['full_name' => 'Moving Student', 'class_id' => $oldClass, 'parent_phone' => '08012345678', 'date_of_birth' => '2015-01-02'])->assertCreated();
        $id = $response->json('studentId');
        $before = (array) DB::table('users')->find($id);
        $invoice = DB::table('fee_invoices')->insertGetId(['student_id' => $id, 'title' => 'Existing fee', 'amount_due' => 1000, 'amount_paid' => 500]);
        $grade = DB::table('grades')->insertGetId(['student_id' => $id, 'term' => 'First', 'academic_year' => '2026/2027', 'total_score' => 80]);
        $attendance = DB::table('attendance')->insertGetId(['student_id' => $id, 'date' => '2026-10-18', 'status' => 'present', 'marked_by' => auth('api')->id()]);
        $this->putJson('/api/users/update-student/'.$id, ['class_id' => $newClass])->assertOk();
        $this->assertDatabaseHas('students', ['id' => $id, 'class_id' => $newClass, 'parent_phone' => '08012345678', 'date_of_birth' => '2015-01-02', 'admission_number' => $response->json('admission_number')]);
        $this->assertDatabaseHas('users', ['id' => $id, 'username' => $before['username'], 'password_hash' => $before['password_hash'], 'full_name' => 'Moving Student']);
        $this->assertDatabaseHas('fee_invoices', ['id' => $invoice, 'amount_paid' => 500]);
        $this->assertDatabaseHas('grades', ['id' => $grade, 'total_score' => 80]);
        $this->assertDatabaseHas('attendance', ['id' => $attendance, 'student_id' => $id, 'status' => 'present']);
        $this->putJson('/api/users/update-student/'.$id, ['class_id' => 999999])->assertUnprocessable();
        $this->deleteJson('/api/users/delete-student/'.$id)->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $id]);
        $this->assertDatabaseMissing('students', ['id' => $id]);
        $this->assertDatabaseMissing('fee_invoices', ['id' => $invoice]);
        $this->assertDatabaseMissing('grades', ['id' => $grade]);
        $this->assertDatabaseMissing('attendance', ['id' => $attendance]);
    }

    public function test_teacher_cannot_move_student_to_another_form_masters_class(): void
    {
        $teacher = User::create(['username' => 'form-master', 'password_hash' => bcrypt('password'), 'full_name' => 'Teacher', 'role' => 'teacher', 'permissions' => ['can_edit_students']]);
        $oldClass = DB::table('classes')->insertGetId(['name' => 'Primary 4', 'tier' => 'primary', 'form_master_id' => $teacher->id]);
        $newClass = DB::table('classes')->insertGetId(['name' => 'Primary 5', 'tier' => 'primary']);
        $response = $this->postJson('/api/users/register-student', ['full_name' => 'Student', 'class_id' => $oldClass])->assertCreated();
        $this->actingAs($teacher, 'api')->putJson('/api/users/update-student/'.$response->json('studentId'), ['class_id' => $newClass])->assertForbidden();
        $this->assertDatabaseHas('students', ['id' => $response->json('studentId'), 'class_id' => $oldClass]);
    }
}
