<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadMediaRequest;
use App\Models\FamilyMember;
use App\Models\Media;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index(Request $request, ?int $memberId = null): JsonResponse
    {
        $query = Media::where(function ($q) use ($request, $memberId) {
            if ($memberId) {
                $q->where('family_member_id', $memberId);
            }
            if (! $request->user()->isElder()) {
                $q->whereNot('visibility', 'private');
            }
        })->latest();

        if (! $request->user()?->isElder() && $memberId) {
            // members can see family-visible media tied to themselves too
            $mine = $request->user()->familyMember?->id === $memberId;
            if (! $mine && ! $request->user()->isElder()) {
                $query->whereNot('visibility', 'private');
            }
        }

        return response()->json(['media' => $query->get()]);
    }

    public function store(UploadMediaRequest $request, ?int $memberId = null): JsonResponse
    {
        $targetMemberId = $memberId ?? $request->user()->familyMember?->id;

        abort_if(! $targetMemberId, 422, 'No family profile attached to this account.');

        $isOwn = $request->user()->familyMember?->id === $targetMemberId;

        abort_if(! $isOwn && ! $request->user()->isElder(), 403, 'You can only upload media to your own profile.');

        $path = $request->file('file')->store('media/'.$targetMemberId, 'private');

        $media = Media::create([
            'family_member_id' => $targetMemberId,
            'file_path' => $path,
            'type' => str_starts_with($request->file('file')->getMimeType(), 'image/') ? 'photo' : 'document',
            'visibility' => $request->input('visibility', 'family'),
            'uploaded_by' => $request->user()->id,
            'caption' => $request->input('caption'),
        ]);

        AuditService::forRequest($request, 'media.uploaded', Media::class, $media->id);

        return response()->json(['media' => $media], 201);
    }
}