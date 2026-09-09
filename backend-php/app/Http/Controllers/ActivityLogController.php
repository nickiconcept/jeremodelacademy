<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * GET /api/activity-logs
     *
     * Returns a paginated list of activity logs with optional filters:
     *   - user_role    (admin, teacher, form_master, student)
     *   - module       (students, teachers, finance, results, settings, auth)
     *   - action       (login, logout, create_student, …)
     *   - user_id      (integer)
     *   - search       (searches user_name, description, target_name)
     *   - date_from    (Y-m-d)
     *   - date_to      (Y-m-d)
     *   - per_page     (integer, default 50)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query()->orderByDesc('created_at');
        
        $user = auth('api')->user();
        if ($user && $user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        // ----- Filters -----
        if ($request->filled('user_role')) {
            $query->where('user_role', $request->user_role);
        }

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('target_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = min((int) ($request->per_page ?? 50), 200);

        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * GET /api/activity-logs/stats
     *
     * Quick aggregated counts for the admin overview — no sensitive data.
     */
    public function stats(): JsonResponse
    {
        $today = now()->toDateString();

        return response()->json([
            'total'        => ActivityLog::count(),
            'today'        => ActivityLog::whereDate('created_at', $today)->count(),
            'by_role'      => ActivityLog::selectRaw('user_role, count(*) as count')
                                ->groupBy('user_role')
                                ->pluck('count', 'user_role'),
            'by_module'    => ActivityLog::selectRaw('module, count(*) as count')
                                ->groupBy('module')
                                ->pluck('count', 'module'),
        ]);
    }

    /**
     * DELETE /api/activity-logs/purge
     *
     * Purge logs older than a given number of days (default 90).
     * Admin-only — add middleware on the route.
     */
    public function purge(Request $request): JsonResponse
    {
        $days = max(1, (int) ($request->days ?? 90));
        $cutoff = now()->subDays($days);

        $deleted = ActivityLog::where('created_at', '<', $cutoff)->delete();

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
            'message' => "Deleted {$deleted} log entries older than {$days} days.",
        ]);
    }
}
