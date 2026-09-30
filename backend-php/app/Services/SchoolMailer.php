<?php

namespace App\Services;

use App\Mail\SchoolMessage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SchoolMailer
{
    public function studentRegistered(?string $parentEmail, string $studentName, string $admissionNumber): void
    {
        if (! $parentEmail) {
            return;
        }

        $this->sendSafely(
            $parentEmail,
            'Student registration received',
            "Dear Parent/Guardian,\n\n{$studentName} has been registered at ".config('app.name')
                .". The admission number and initial portal password are {$admissionNumber}. The student will be required to change the password at first sign-in.\n\nRegards,\n"
                .config('app.name')
        );
    }

    public function teacherRegistered(?string $email, string $teacherName, string $staffId): void
    {
        if (! $email) {
            return;
        }

        $this->sendSafely(
            $email,
            'Staff account created',
            "Dear {$teacherName},\n\nYour staff portal account has been created. Your staff ID and initial portal password are {$staffId}. You will be required to change the password at first sign-in.\n\nRegards,\n"
                .config('app.name')
        );
    }

    public function sendAccountSetupReminder(?string $email, string $name, string $accountId, ?string $setupUrl): void
    {
        if (! $email) {
            return;
        }

        $this->sendSafely(
            $email,
            'Set up your '.config('app.name').' portal password',
            "Dear {$name},\n\nA password setup is required for the account {$accountId}. Use this secure, single-use link: "
                .($setupUrl ?? 'Please contact the school office to request a new setup link.')."\n\nRegards,\n"
                .config('app.name')
        );
    }

    public function feeReceipt(int $studentId, string $receiptNumber, float $amount, string $paymentMethod, string $invoiceTitle): void
    {
        $student = DB::table('students as s')
            ->join('users as u', 'u.id', '=', 's.id')
            ->where('s.id', $studentId)
            ->select('s.parent_email', 's.parent_name', 'u.full_name', 's.admission_number')
            ->first();

        if (! $student?->parent_email) {
            return;
        }

        $guardianName = $student->parent_name ?: 'Parent/Guardian';
        $this->sendSafely(
            $student->parent_email,
            "Fee payment receipt {$receiptNumber}",
            "Dear {$guardianName},\n\nA payment has been recorded for {$student->full_name} ({$student->admission_number}).\n"
                ."Receipt: {$receiptNumber}\nAmount: ".number_format($amount, 2)."\nPayment method: {$paymentMethod}\nInvoice: {$invoiceTitle}\n\n"
                ."Please retain this message as your receipt.\n\nRegards,\n".config('app.name')
        );
    }

    public function resultEntryClosed(string $term, string $academicYear): void
    {
        $addresses = DB::table('students')
            ->where('status', 'active')
            ->whereNotNull('parent_email')
            ->where('parent_email', '!=', '')
            ->distinct()
            ->pluck('parent_email')
            ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values();

        foreach ($addresses->chunk(100) as $batch) {
            $this->sendSafely(
                config('mail.from.address'),
                "Result entry closed: {$term} {$academicYear}",
                "Dear Parent/Guardian,\n\nResult entry for {$term} of the {$academicYear} academic session has closed. This does not necessarily mean report cards are published yet; please wait for an official school notice.\n\nRegards,\n"
                    .config('app.name'),
                $batch->all()
            );
        }
    }

    private function sendSafely(string $to, string $subject, string $body, array $bcc = []): void
    {
        try {
            $mailer = Mail::to($to);
            if ($bcc !== []) {
                $mailer->bcc($bcc);
            }
            $mailer->send(new SchoolMessage($subject, $body));
        } catch (Throwable $exception) {
            Log::warning('School notification email could not be sent.', [
                'recipient_count' => count($bcc) ?: 1,
                'exception' => $exception::class,
            ]);
        }
    }
}
