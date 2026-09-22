<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateFamilyMemberRequest;
use App\Http\Requests\UploadPhotoRequest;
use App\Models\FamilyMember;
use App\Services\AuditService;
use App\Services\MemberVisibilityService;
use App\Services\RelationshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FamilyMemberController extends Controller
{
    public function __construct(
        private readonly MemberVisibilityService $visibility,
        private readonly RelationshipService $relationships,
    ) {}

    /**
     * Private registry directory — only verified members (or elders).
     */
    public function index(Request $request): JsonResponse
    {
        $query = FamilyMember::with(['branch', 'privacySettings'])->where('status', FamilyMember::STATUS_VERIFIED);

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(fn ($q) => $q
                ->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%"));
        }

        if ($request->filled('branch_id')) {
            $query->where('family_branch_id', $request->integer('branch_id'));
        }

        $members = $query->orderBy('last_name')->orderBy('first_name')->get();

        return response()->json([
            'members' => $this->visibility->serializeMany($members, $request->user(), withRelations: true),
            'count' => $members->count(),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $member = FamilyMember::with(['branch', 'privacySettings'])->findOrFail($id);

        if (! $member->isVerified() && $member->user_id !== $request->user()->id) {
            abort(403, 'This member is not yet verified and cannot be viewed.');
        }

        return response()->json([
            'member' => $this->visibility->serializeOne($member, $member->privacySettings, $request->user(), withRelations: true),
        ]);
    }

    /**
     * A fuller profile digest for a verified member, including their close kin.
     */
    public function profile(Request $request, int $id): JsonResponse
    {
        $member = FamilyMember::with(['branch', 'privacySettings', 'allParents', 'children', 'spouses'])->findOrFail($id);

        if (! $member->isVerified() && $member->user_id !== $request->user()->id) {
            abort(403, 'This member is not yet verified and cannot be viewed.');
        }

        $data = $this->visibility->serializeOne($member, $member->privacySettings, $request->user(), withRelations: true);

        $viewerMember = $request->user()->familyMember;
        $data['relationship_to_you'] = $viewerMember
            ? $this->relationships->resolve($viewerMember->id, $member->id)
            : null;

        $data['parents'] = $this->visibility->serializeMany($member->allParents, $request->user());
        $data['children'] = $this->visibility->serializeMany($member->children, $request->user());
        $data['spouses'] = $this->visibility->serializeMany($member->spouses, $request->user());

        return response()->json(['member' => $data]);
    }

    public function update(UpdateFamilyMemberRequest $request, int $id): JsonResponse
    {
        $member = FamilyMember::findOrFail($id);

        abort_unless($member->user_id === $request->user()->id || $request->user()->isAdmin(), 403, 'You can only edit your own profile.');

        $member->update($request->only(['first_name', 'last_name', 'gender', 'phone', 'email', 'occupation', 'bio']));

        if ($member->user_id === $request->user()->id && $member->email === $request->user()->email) {
            // keep auth email in sync only when unchanged
            $request->user()->update(['name' => $member->full_name]);
        }

        AuditService::forRequest($request, 'member.profile_updated', FamilyMember::class, $member->id);

        return response()->json([
            'member' => $this->visibility->serializeOne($member->fresh(['privacySettings']), $member->privacySettings, $request->user(), true),
        ]);
    }

    public function uploadPhoto(UploadPhotoRequest $request, int $id): JsonResponse
    {
        $member = FamilyMember::findOrFail($id);

        abort_unless($member->user_id === $request->user()->id || $request->user()->isAdmin(), 403, 'You can only change your own photo.');

        if ($member->photo_path) {
            Storage::disk('private')->delete($member->photo_path);
        }

        $path = $request->file('photo')->store('photos/'.$member->id, 'private');

        $member->update(['photo_path' => $path]);

        AuditService::forRequest($request, 'member.photo_uploaded', FamilyMember::class, $member->id);

        return response()->json([
            'member' => $this->visibility->serializeOne($member->fresh(['privacySettings']), $member->privacySettings, $request->user(), true),
            'photo_url' => $path ? url('/api/media/serve/'.$member->id.'/photo') : null,
        ]);
    }

    public function servePhoto(Request $request, int $id): \Symfony\Component\HttpFoundation\Response
    {
        $member = FamilyMember::findOrFail($id);

        $viewer = $request->user();
        $hasAccess = $viewer && $viewer->isElder();
        $hasAccess = $hasAccess || ($member->user_id && $viewer && $viewer->id === $member->user_id);

        $setting = $member->privacySettings->where('field_name', 'photo')->first();
        $visibility = $setting?->visibility ?? 'family';

        if ($hasAccess || $visibility === 'public' || ($viewer && $viewer->verifiedFamilyMember())) {
            if ($member->photo_path && Storage::disk('private')->exists($member->photo_path)) {
                $file = Storage::disk('private')->get($member->photo_path);
                $mime = Storage::disk('private')->mimeType($member->photo_path);

                return response($file, 200, ['Content-Type' => $mime, 'Cache-Control' => 'private, max-age=3600']);
            }
        }

        abort(404);
    }
}