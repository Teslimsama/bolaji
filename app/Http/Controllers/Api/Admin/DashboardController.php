<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FamilyMember;
use App\Models\VerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'members_verified' => FamilyMember::where('status', FamilyMember::STATUS_VERIFIED)->count(),
            'members_pending' => FamilyMember::where('status', FamilyMember::STATUS_PENDING)->count(),
            'verifications_pending' => VerificationRequest::where('status', VerificationRequest::STATUS_PENDING)->count(),
            'verifications_reviewed' => VerificationRequest::where('status', '!=', VerificationRequest::STATUS_PENDING)->count(),
            'recent_audit' => AuditLog::with('actor:id,name')->latest()->limit(8)->get(),
            'weekly_verifications' => VerificationRequest::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
        ]);
    }
}