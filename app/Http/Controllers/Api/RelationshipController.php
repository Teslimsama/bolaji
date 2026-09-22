<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FamilyMember;
use App\Services\AuditService;
use App\Services\RelationshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RelationshipController extends Controller
{
    public function __construct(private readonly RelationshipService $service) {}

    /**
     * The signature feature: "how am I related to this person?"
     */
    public function lookup(Request $request, int $memberId): JsonResponse
    {
        $viewerMember = $request->user()->familyMember;

        abort_if(! $viewerMember, 403, 'You need a verified family profile to run relationship lookups.');

        if (! $viewerMember->isVerified()) {
            abort(403, 'Your family membership must be verified before you can run relationship lookups.');
        }

        $target = FamilyMember::findOrFail($memberId);
        abort_if(! $target->isVerified(), 404, 'This member is not part of the verified registry yet.');

        $result = $this->service->resolve($viewerMember->id, $target->id);

        if ($result === null) {
            return response()->json([
                'message' => 'No family connection could be established for these two members yet.',
                'result' => null,
            ]);
        }

        $result['target'] = ['id' => $target->id, 'full_name' => $target->full_name, 'gender' => $target->gender];

        return response()->json(['result' => $result]);
    }

    /**
     * Compare any two verified members (elders use this to audit the tree).
     */
    public function compare(Request $request): JsonResponse
    {
        $plus = $request->user()->isAdmin() ? ['member.a'] : ['member.a', 'member.b'];
        $data = $request->validate([
            'subject_id' => ['required', 'integer', 'exists:family_members,id'],
            'target_id' => ['required', 'integer', 'exists:family_members,id', 'different:subject_id'],
        ]);

        $subject = FamilyMember::findOrFail($data['subject_id']);
        $target = FamilyMember::findOrFail($data['target_id']);

        if (! $subject->isVerified() || ! $target->isVerified()) {
            abort(422, 'Both members must be verified.');
        }

        $result = $this->service->resolve($subject->id, $target->id);

        if ($result === null) {
            return response()->json(['message' => 'No family connection could be established.', 'result' => null]);
        }

        return response()->json(['result' => $result]);
    }
}