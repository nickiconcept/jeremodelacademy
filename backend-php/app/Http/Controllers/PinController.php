<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PinController extends Controller
{
    private function generateRandomPIN() {
        return strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4));
    }

    public function generatePins(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $count = (int)$request->input('count', 50);

        try {
            $pinsToInsert = [];
            for ($i = 0; $i < $count; $i++) {
                $pinsToInsert[] = [
                    'pin' => $this->generateRandomPIN(),
                    'usage_count' => 0,
                    'status' => 'active',
                    'generated_at' => now()
                ];
            }
            DB::table('result_pins')->insert($pinsToInsert);
            return response()->json(['message' => "Successfully generated {$count} universal PINs"], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function getPins(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        try {
            $pins = DB::table('result_pins as p')
                ->leftJoin('students as s', 'p.student_id', '=', 's.id')
                ->leftJoin('users as u', 's.id', '=', 'u.id')
                ->select('p.*', 'u.full_name as student_name', 's.admission_number')
                ->orderByDesc('p.generated_at')
                ->get();
            return response()->json($pins);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function verifyPin(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'student') return response()->json(['error' => 'Unauthorized'], 403);

        $pin = $request->input('pin');
        $term = $request->input('term');
        $academic_year = $request->input('academic_year');
        $studentId = $user->id;

        if (!$term || !$academic_year) {
            return response()->json(['error' => 'Term and academic session are required.'], 400);
        }

        try {
            $pinRow = DB::table('result_pins')->where('pin', strtoupper($pin))->first();

            if (!$pinRow) {
                return response()->json(['error' => 'Invalid PIN. Please check the code and try again.'], 404);
            }

            if ($pinRow->student_id) {
                if ($pinRow->student_id !== $studentId || $pinRow->term !== $term || $pinRow->academic_year !== $academic_year) {
                    return response()->json(['error' => 'This PIN has already been used to unlock another student or result.'], 403);
                }
                if ($pinRow->status === 'exhausted' || $pinRow->usage_count >= 5) {
                    return response()->json(['error' => 'This PIN has exceeded its maximum limit of 5 checks.'], 403);
                }
            } else {
                DB::table('result_pins')->where('id', $pinRow->id)->update([
                    'student_id' => $studentId,
                    'term' => $term,
                    'academic_year' => $academic_year,
                    'usage_count' => 0,
                    'status' => 'active'
                ]);
            }

            $updatedPin = DB::table('result_pins')->where('id', $pinRow->id)->first();

            return response()->json([
                'message' => 'PIN successfully verified and bound to this result sheet!',
                'pin' => $updatedPin
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }
}
