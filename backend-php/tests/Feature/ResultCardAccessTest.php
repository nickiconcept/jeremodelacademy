<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\ResultAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ResultCardAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::create(['username' => 'cards-admin', 'full_name' => 'Cards Admin', 'password_hash' => bcrypt('password'), 'role' => 'admin', 'permissions' => []]);
        $this->student = User::create(['username' => 'cards-student', 'full_name' => 'Cards Student', 'password_hash' => bcrypt('password'), 'role' => 'student']);
        DB::table('students')->insert(['id' => $this->student->id, 'admission_number' => 'CARD-001']);
        foreach (['1st Term', '2nd Term'] as $term) {
            DB::table('result_publications')->insert(['student_id' => $this->student->id, 'term' => $term, 'academic_year' => '2026/2027', 'published_at' => now()]);
        }
    }

    private function card(bool $issue = true): object
    {
        $this->actingAs($this->admin, 'api')->postJson('/api/pins/generate', ['count' => 1])->assertCreated();
        $pin = DB::table('result_pins')->orderByDesc('id')->first();
        if ($issue) {
            $this->postJson("/api/pins/{$pin->id}/issue", ['student_id' => $this->student->id])->assertOk();
        }
        $this->actingAs($this->student, 'api');

        return $pin;
    }

    private function activate(object $pin, string $term = '1st Term')
    {
        return $this->postJson('/api/pins/verify', ['pin' => $pin->pin, 'term' => $term, 'academic_year' => '2026/2027']);
    }

    private function invoice(?string $term, float $paid = 0): int
    {
        return DB::table('fee_invoices')->insertGetId([
            'student_id' => $this->student->id, 'title' => 'Arbitrary fee description',
            'term' => $term, 'academic_year' => $term ? '2026/2027' : null,
            'amount_due' => 50000, 'amount_paid' => $paid, 'status' => 'paid',
        ]);
    }

    public function test_serials_are_unique_and_issuance_does_not_activate_or_consume(): void
    {
        $pin = $this->card();
        $this->assertMatchesRegularExpression('/^JMA-\d{8}$/', $pin->serial_number);
        $this->assertDatabaseHas('result_pins', ['id' => $pin->id, 'student_id' => null, 'term' => null, 'usage_count' => 0, 'issued_to_student_id' => $this->student->id, 'issued_by' => $this->admin->id]);
        $this->actingAs($this->admin, 'api')->postJson("/api/pins/{$pin->id}/issue", ['student_id' => $this->student->id])->assertStatus(409);
        $this->postJson('/api/pins/generate', ['count' => 3])->assertCreated();
        $this->assertSame(4, DB::table('result_pins')->distinct()->count('serial_number'));
        $this->getJson('/api/pins')->assertOk()->assertJsonFragment(['serial_number' => $pin->serial_number, 'student_name' => 'Cards Student']);
    }

    public function test_first_view_counts_once_and_five_views_exhaust_the_card(): void
    {
        $pin = $this->card();
        $this->activate($pin)->assertOk()->assertJsonPath('remaining_checks', 4)->assertJsonPath('report_card.term', '1st Term');
        for ($i = 2; $i <= 5; $i++) {
            $this->getJson('/api/report-card/'.$this->student->id.'?term=1st%20Term&year=2026%2F2027')->assertOk();
            $this->assertDatabaseHas('result_pins', ['id' => $pin->id, 'usage_count' => $i]);
        }
        $this->activate($pin)->assertForbidden();
        $this->getJson('/api/report-card/'.$this->student->id.'?term=1st%20Term&year=2026%2F2027')->assertForbidden();
        $this->assertDatabaseHas('result_pins', ['id' => $pin->id, 'usage_count' => 5, 'status' => 'exhausted']);
    }

    public function test_other_results_need_another_pin_and_explicit_pin_is_charged(): void
    {
        $first = $this->card();
        $second = $this->card();
        $this->activate($first)->assertOk();
        $this->activate($first, '2nd Term')->assertForbidden();
        $this->activate($second, '2nd Term')->assertOk();
        $this->assertDatabaseHas('result_pins', ['id' => $first->id, 'usage_count' => 1, 'term' => '1st Term']);
        $this->assertDatabaseHas('result_pins', ['id' => $second->id, 'usage_count' => 1, 'term' => '2nd Term']);
    }

    public function test_same_term_in_another_session_is_a_different_result(): void
    {
        $pin = $this->card();
        $this->activate($pin)->assertOk();
        DB::table('result_publications')->insert(['student_id' => $this->student->id, 'term' => '1st Term', 'academic_year' => '2025/2026', 'published_at' => now()]);
        $this->postJson('/api/pins/verify', ['pin' => $pin->pin, 'term' => '1st Term', 'academic_year' => '2025/2026'])->assertForbidden();
        $this->assertDatabaseHas('result_pins', ['id' => $pin->id, 'usage_count' => 1, 'academic_year' => '2026/2027']);
    }

    public function test_entering_another_pin_for_the_same_result_charges_only_that_pin(): void
    {
        $first = $this->card();
        $second = $this->card();
        $this->activate($first)->assertOk();
        $this->activate($second)->assertOk();
        $this->assertDatabaseHas('result_pins', ['id' => $first->id, 'usage_count' => 1]);
        $this->assertDatabaseHas('result_pins', ['id' => $second->id, 'usage_count' => 1]);
    }

    public function test_custom_invoices_require_and_store_an_explicit_period(): void
    {
        $this->actingAs($this->admin, 'api');
        $data = ['student_id' => $this->student->id, 'title' => 'Books', 'amount' => 1000];
        $this->postJson('/api/fees/add', $data)->assertUnprocessable();
        $this->postJson('/api/fees/add', $data + ['term' => '1st Term', 'academic_year' => '2026/2027'])->assertOk();
        $this->postJson('/api/fees/add', $data + ['term' => '2nd Term', 'academic_year' => '2026/2027'])->assertOk();
        $this->assertDatabaseHas('fee_invoices', ['student_id' => $this->student->id, 'term' => '1st Term', 'academic_year' => '2026/2027']);
        $this->assertDatabaseCount('fee_invoices', 2);
    }

    public function test_unissued_and_another_students_cards_cannot_be_activated(): void
    {
        $pin = $this->card(false);
        $this->activate($pin)->assertForbidden();
        $other = User::create(['username' => 'other', 'full_name' => 'Other', 'password_hash' => bcrypt('password'), 'role' => 'student']);
        DB::table('students')->insert(['id' => $other->id, 'admission_number' => 'CARD-002']);
        $this->actingAs($this->admin, 'api')->postJson("/api/pins/{$pin->id}/issue", ['student_id' => $other->id])->assertOk();
        $this->actingAs($this->student, 'api');
        $this->activate($pin)->assertForbidden();
        $this->postJson("/api/pins/{$pin->id}/issue", ['student_id' => $this->student->id])->assertForbidden();
        $this->assertDatabaseHas('result_pins', ['id' => $pin->id, 'student_id' => null, 'usage_count' => 0]);
    }

    public function test_unpaid_and_partial_debt_block_before_binding_regardless_of_title_or_status(): void
    {
        $pin = $this->card();
        $id = $this->invoice('1st Term');
        $this->activate($pin)->assertForbidden();
        DB::table('fee_invoices')->where('id', $id)->update(['amount_paid' => 25000]);
        $this->activate($pin)->assertForbidden();
        $this->assertDatabaseHas('result_pins', ['id' => $pin->id, 'student_id' => null, 'usage_count' => 0]);
        DB::table('fee_invoices')->where('id', $id)->update(['amount_paid' => 50000, 'status' => 'unpaid']);
        $this->activate($pin)->assertOk();
        DB::table('fee_invoices')->where('id', $id)->update(['amount_due' => 60000]);
        $this->getJson('/api/report-card/'.$this->student->id.'?term=1st%20Term&year=2026%2F2027')->assertForbidden();
        $this->assertDatabaseHas('result_pins', ['id' => $pin->id, 'usage_count' => 1]);
    }

    public function test_other_term_debt_does_not_block(): void
    {
        $pin = $this->card();
        $this->invoice('2nd Term');
        $this->activate($pin)->assertOk();
    }

    public function test_unclassified_debt_requires_staff_classification(): void
    {
        $pin = $this->card();
        $invoice = $this->invoice(null);
        $this->activate($pin)->assertForbidden();
        $this->patchJson("/api/fee-invoices/{$invoice}/period", ['term' => '2nd Term', 'academic_year' => '2026/2027'])->assertForbidden();
        $this->actingAs($this->admin, 'api')->patchJson("/api/fee-invoices/{$invoice}/period", ['term' => '2nd Term', 'academic_year' => '2026/2027'])->assertOk();
        $this->actingAs($this->student, 'api');
        $this->activate($pin)->assertOk();
    }

    public function test_unpublished_and_raw_endpoints_cannot_bypass_checks(): void
    {
        $pin = $this->card();
        DB::table('result_publications')->delete();
        $this->activate($pin)->assertForbidden();
        $this->getJson('/api/grades')->assertForbidden();
        $this->getJson('/api/behavioral/'.$this->student->id)->assertForbidden();
        $this->assertDatabaseHas('result_pins', ['id' => $pin->id, 'student_id' => null, 'usage_count' => 0]);
    }

    public function test_failed_report_build_leaves_card_unbound_and_uncharged(): void
    {
        $pin = $this->card();
        try {
            app(ResultAccess::class)->view($this->student->id, '1st Term', '2026/2027', $pin->pin, function () {
                throw new \RuntimeException('Report unavailable');
            });
            $this->fail('Expected report failure');
        } catch (\RuntimeException $e) {
            $this->assertSame('Report unavailable', $e->getMessage());
        }
        $this->assertDatabaseHas('result_pins', ['id' => $pin->id, 'student_id' => null, 'usage_count' => 0]);
    }

    public function test_migration_preserves_existing_bindings_and_only_classifies_known_titles(): void
    {
        $migration = require database_path('migrations/2026_10_19_101541_add_card_issuance_and_invoice_periods.php');
        $migration->down();
        $id = DB::table('result_pins')->insertGetId(['pin' => 'AAAA-BBBB-CCCC', 'student_id' => $this->student->id, 'term' => '1st Term', 'academic_year' => '2026/2027', 'usage_count' => 3, 'status' => 'active']);
        DB::table('fee_invoices')->insert(['student_id' => $this->student->id, 'title' => 'School Fees - JSS1 - 1st Term 2026/2027', 'amount_due' => 500, 'amount_paid' => 0, 'status' => 'unpaid']);
        DB::table('fee_invoices')->insert(['student_id' => $this->student->id, 'title' => 'Old balance', 'amount_due' => 500, 'amount_paid' => 0, 'status' => 'unpaid']);
        $migration->up();
        $this->assertDatabaseHas('result_pins', ['id' => $id, 'usage_count' => 3, 'student_id' => $this->student->id, 'issued_to_student_id' => $this->student->id, 'issued_at' => null, 'issued_by' => null]);
        $this->assertDatabaseHas('fee_invoices', ['title' => 'School Fees - JSS1 - 1st Term 2026/2027', 'term' => '1st Term', 'academic_year' => '2026/2027']);
        $this->assertDatabaseHas('fee_invoices', ['title' => 'Old balance', 'term' => null]);
    }
}
