<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestAccessRequest;
use App\Models\Announcement;
use App\Models\FamilyBranch;
use App\Models\FamilyEvent;
use App\Models\FamilyMember;
use App\Models\User;
use App\Models\VerificationRequest;
use App\Services\AuditService;
use App\Services\MemberVisibilityService;
use Illuminate\Http\JsonResponse;

class PublicController extends Controller
{
    public function __construct(private readonly MemberVisibilityService $visibility) {}

    /**
     * Public site content — family identity only, no living member data.
     */
    public function home(): JsonResponse
    {
        return response()->json([
            'family_name' => 'Bolaji',
            'tagline' => 'One family. Many branches. One heritage.',
            'heritage' => [
                'title' => 'Our Heritage',
                'body' => 'The Bolaji family traces its roots across generations of Yoruba heritage. '
                    .'What began with our founding elders has grown into many branches — each carrying '
                    .'the name forward through faith, community and kinship.',
            ],
            'values' => ['Kinship', 'Honour', 'Legacy', 'Unity'],
            'announcements' => Announcement::where('visibility', 'public')
                ->whereNotNull('published_at')
                ->orderByDesc('published_at')
                ->limit(5)
                ->get(['id', 'title', 'body', 'published_at']),
            'events' => FamilyEvent::where('visibility', 'public')
                ->where('event_date', '>=', now()->toDateString())
                ->orderBy('event_date')
                ->limit(5)
                ->get(['id', 'title', 'event_date', 'location']),
        ]);
    }

    public function branches(): JsonResponse
    {
        return response()->json([
            'branches' => FamilyBranch::withCount('members')
                ->with('parent:id,name')
                ->get(['id', 'name', 'slug', 'description', 'parent_branch_id'])
                ->map(fn ($branch) => [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'slug' => $branch->slug,
                    'description' => $branch->description,
                    'parent' => $branch->parent?->name,
                    'member_count' => $branch->members_count,
                ]),
        ]);
    }

    /**
     * Gated sign-up: creates a pending member + verification request. No
     * directory access until a Family Elder/Admin approves.
     */
    public function requestAccess(RequestAccessRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => trim($request->input('first_name').' '.$request->input('last_name')),
            'email' => $request->input('email'),
            'password' => $request->input('password'),
        ]);

        $member = FamilyMember::create([
            'user_id' => $user->id,
            'first_name' => $request->input('first_name'),
            'last_name' => $request->input('last_name'),
            'gender' => $request->input('gender'),
            'family_branch_id' => $request->input('family_branch_id'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'status' => FamilyMember::STATUS_PENDING,
            'created_by' => $user->id,
        ]);

        VerificationRequest::create([
            'family_member_id' => $member->id,
            'claimed_relationship_type' => $request->input('claimed_relationship_type'),
            'claimed_related_to_id' => $request->input('claimed_related_to_id'),
            'submitted_by' => $user->id,
            'notes' => $request->input('notes'),
            'status' => VerificationRequest::STATUS_PENDING,
        ]);

        AuditService::forRequest($request, 'access.requested', FamilyMember::class, $member->id, [
            'email' => $user->email,
        ]);

        return response()->json([
            'message' => 'Your request has been submitted. A family elder will review and confirm your lineage before you can access the registry.',
            'member' => $this->visibility->serializeOne($member, $member->privacySettings, $user, true),
        ], 201);
    }
}