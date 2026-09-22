<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('actor:id,name')->latest();

        if ($request->filled('action')) {
            $query->where('action', 'like', "%{$request->input('action')}%");
        }

        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->integer('actor_id'));
        }

        $page = $request->integer('page', 1);
        $perPage = min($request->integer('per_page', 25), 100);

        return response()->json([
            'logs' => $query->paginate($perPage, ['*'], 'page', $page),
        ]);
    }
}