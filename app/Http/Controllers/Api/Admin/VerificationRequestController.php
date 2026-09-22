<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewVerificationRequest;
use App\Models\FamilyMember;
use App\Models\FamilyRelationship;
use App\Models\VerificationRequest;
use App\Services\AuditService;
use App\Services\MemberVisibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationRequestController extends Controller
{
    public function __construct(private readonly MemberVisibilityService $visibility) {}

    public function index(Request $request): JsonResponse
    {
        $query = VerificationRequest::with([
            'familyMember:id,first_name,last_name,gender,status,created_at',
            'claimedRelatedTo:id,first_name,last_name',
            'reviewer:id,name',
        ])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json([
            'requests' => $query->get(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $verification = VerificationRequest::with([
            'familyMember:id,first_name,last_name,gender,status,phone,email,family_branch_id,created_at',
            'claimedRelatedTo:id,first_name,last_name',
            'reviewer:id,name',
            'familyMember.branch:id,name',
        ])->findOrFail($id);

        return response()->json(['request' => $verification]);
    }

    public function review(ReviewVerificationRequest $request, int $id): JsonResponse
    {
        $verification = VerificationRequest::with('familyMember')->findOrFail($id);

        abort_if($verification->status === VerificationRequest::STATUS_APPROVED, 422, 'This request has already been approved.');

        $reviewer = $request->user();

        match ($request->input('status')) {
            'approved' => $this->approve($verification, $reviewer, $request),
            'rejected' => $this->reject($verification, $reviewer, $request),
            'more_info' => $this->requestMoreInfo($verification, $reviewer, $request),
            default => null,
        };

        AuditService::forRequest($request, 'verification.'.$request->input('status'), VerificationRequest::class, $verification->id, [
            'member_id' => $verification->family_member_id,
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'request' => $verification->fresh(['familyMember', 'claimedRelatedTo', 'reviewer']),
            'message' => 'Verification request updated.',
        ]);
    }

    private function approve(VerificationRequest $verification, $reviewer, Request $request): void
    {
        $member = $verification->familyMember;

        $member->update([
            'status' => FamilyMember::STATUS_VERIFIED,
            'verified_by' => $reviewer->id,
            'verified_at' => now(),
        ]);

        $parentId = $request->integer('parent_id') ?: null;
        $motherId = $request->integer('mother_id') ?: null;

        $this->linkParentIfNotExists($member->id, $parentId, $request->input('relationship_type', 'biological'));
        $this->linkParentIfNotExists($member->id, $motherId, 'biological');

        $verification->update([
            'status' => VerificationRequest::STATUS_APPROVED,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'notes' => $request->input('notes'),
        ]);
    }

    private function linkParentIfNotExists(int $childId, ?int $parentId, string $type): void
    {
        if (! $parentId) {
            return;
        }

        $exists = FamilyRelationship::where('parent_id', $parentId)->where('child_id', $childId)->exists();

        if (! $exists) {
            FamilyRelationship::create([
                'parent_id' => $parentId,
                'child_id' => $childId,
                'type' => $type,
                'status' => 'active',
            ]);
        }
    }

    private function reject(VerificationRequest $verification, $reviewer, Request $request): void
    {
        $verification->familyMember->update(['status' => FamilyMember::STATUS_REJECTED]);

        $verification->update([
            'status' => VerificationRequest::STATUS_REJECTED,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'notes' => $request->input('notes'),
        ]);
    }

    private function requestMoreInfo(VerificationRequest $verification, $reviewer, Request $request): void
    {
        $verification->update([
            'status' => VerificationRequest::STATUS_MORE_INFO,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'notes' => $request->input('notes'),
        ]);
    }
}