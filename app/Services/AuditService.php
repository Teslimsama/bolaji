<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditService
{
    public static function log(
        ?User $actor,
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        array $meta = []
    ): AuditLog {
        $request = app(Request::class);

        return AuditLog::create([
            'actor_id' => $actor?->id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'meta' => $meta,
            'ip_address' => $request->ip(),
        ]);
    }

    public static function forRequest(Request $request, string $action, ?string $targetType = null, ?int $targetId = null, array $meta = []): AuditLog
    {
        return AuditLog::create([
            'actor_id' => $request->user()?->id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'meta' => $meta,
            'ip_address' => $request->ip(),
        ]);
    }
}