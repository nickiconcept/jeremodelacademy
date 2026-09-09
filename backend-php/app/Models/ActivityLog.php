<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_role',
        'user_name',
        'action',
        'module',
        'target_type',
        'target_id',
        'target_name',
        'description',
        'meta',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    /**
     * Relationship to the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Convenience static method to write a log entry quickly.
     *
     * @param string $action     Short action key, e.g. 'login', 'create_student'
     * @param string $module     Feature area, e.g. 'students', 'finance'
     * @param string $description Human-readable message
     * @param array  $extras     Additional fields (target_type, target_id, target_name, meta)
     */
    public static function log(
        string $action,
        string $module,
        string $description,
        array $extras = []
    ): self {
        $request = request();
        $user = auth('api')->user() ?? auth()->user();

        return self::create(array_merge([
            'user_id'     => $user?->id,
            'user_role'   => $user?->role,
            'user_name'   => $user?->full_name ?? $user?->username,
            'action'      => $action,
            'module'      => $module,
            'description' => $description,
            'ip_address'  => $request?->ip(),
            'user_agent'  => $request?->userAgent(),
        ], $extras));
    }
}
