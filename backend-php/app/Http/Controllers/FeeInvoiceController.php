<?php

namespace App\Http\Controllers;

use App\Services\SchoolMailer;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $this->requireAdmin();

        $student_id = $request->query('student_id');
        $query = DB::table('fee_invoices')
            ->join('users', 'fee_invoices.student_id', '=', 'users.id')
            ->select('fee_invoices.*', 'users.full_name');

        if ($student_id) {
            $query->where('student_id', $student_id);
        }

        $invoices = $query->orderBy('status', 'desc')->orderBy('created_at', 'desc')->get();

        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $this->requireAdmin();

        $request->validate([
            'student_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'category' => 'required|string',
            'amount_due' => 'required|numeric',
        ]);

        try {
            $id = DB::table('fee_invoices')->insertGetId([
                'student_id' => $request->student_id,
                'title' => $request->title,
                'category' => $request->category,
                'amount_due' => $request->amount_due,
                'amount_paid' => $request->amount_paid ?? 0,
                'status' => $request->status ?? 'unpaid',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json(['message' => 'Invoice created successfully', 'id' => $id], 201);
        } catch (QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return response()->json(['error' => 'An invoice with this title already exists for the student.'], 400);
            }

            return response()->json(['error' => 'Database error occurred while creating the invoice.'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $this->requireAdmin();

        $updated = DB::table('fee_invoices')->where('id', $id)->update([
            'title' => $request->title,
            'category' => $request->category,
            'amount_due' => $request->amount_due,
            'amount_paid' => $request->amount_paid,
            'status' => $request->status,
            'updated_at' => now(),
        ]);

        if (! $updated) {
            return response()->json(['error' => 'Invoice not found or no changes made'], 404);
        }

        return response()->json(['message' => 'Invoice updated successfully']);
    }

    public function recordPayment(Request $request, $id)
    {
        $this->requireAdmin();

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'gt:0'],
            'payment_method' => ['nullable', 'string', 'max:80'],
        ]);

        $amount = (float) $validated['amount'];
        $paymentMethod = $validated['payment_method'] ?? 'Unspecified';
        $payment = DB::transaction(function () use ($id, $amount, $paymentMethod): array {
            $invoice = DB::table('fee_invoices')->where('id', $id)->lockForUpdate()->first();
            abort_unless($invoice, 404, 'Invoice not found.');
            $balance = max(0, (float) $invoice->amount_due - (float) $invoice->amount_paid);
            abort_if($amount > $balance, 422, 'Payment exceeds the invoice balance.');

            $newPaid = (float) $invoice->amount_paid + $amount;
            $status = $newPaid >= (float) $invoice->amount_due ? 'paid' : 'partial';
            $receiptNumber = 'REC-'.now()->format('Y').'-'.strtoupper(bin2hex(random_bytes(4)));

            DB::table('fee_invoices')->where('id', $id)->update([
                'amount_paid' => $newPaid,
                'status' => $status,
                'updated_at' => now(),
            ]);
            DB::table('fee_receipts')->insert([
                'invoice_id' => $id,
                'receipt_number' => $receiptNumber,
                'amount_paid' => $amount,
                'payment_date' => now()->toDateString(),
                'payment_method' => $paymentMethod,
                'logged_by' => auth('api')->id(),
            ]);

            return [
                'student_id' => (int) $invoice->student_id,
                'title' => $invoice->title,
                'receipt_number' => $receiptNumber,
                'status' => $status,
            ];
        });

        app(SchoolMailer::class)->feeReceipt(
            $payment['student_id'],
            $payment['receipt_number'],
            $amount,
            $paymentMethod,
            $payment['title']
        );

        return response()->json([
            'message' => 'Payment recorded successfully',
            'status' => $payment['status'],
            'receipt_number' => $payment['receipt_number'],
        ]);
    }

    public function destroy($id)
    {
        $this->requireAdmin();

        $deleted = DB::table('fee_invoices')->where('id', $id)->delete();
        if (! $deleted) {
            return response()->json(['error' => 'Invoice not found'], 404);
        }

        return response()->json(['message' => 'Invoice deleted successfully']);
    }
}
