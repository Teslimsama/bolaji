<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FamilyMember;
use App\Models\FamilyRelationship;
use App\Models\Marriage;
use App\Services\MemberVisibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TreeController extends Controller
{
    public function __construct(private readonly MemberVisibilityService $visibility) {}

    /**
     * Flat graph payload for verified members so the frontend tree renderer can
     * lay generations out: nodes + parent/child edges + spouse edges.
     */
    public function index(Request $request): JsonResponse
    {
        $members = FamilyMember::with(['branch', 'privacySettings'])
            ->where('status', FamilyMember::STATUS_VERIFIED)
            ->get();

        $memberIds = $members->pluck('id')->all();

        $relationships = FamilyRelationship::where('status', 'active')
            ->where(function ($q) use ($memberIds) {
                $q->whereIn('parent_id', $memberIds)->whereIn('child_id', $memberIds);
            })
            ->get(['id', 'parent_id', 'child_id', 'type']);

        $marriages = Marriage::whereIn('person_one_id', $memberIds)
            ->whereIn('person_two_id', $memberIds)
            ->where('status', '!=', 'divorced')
            ->get(['id', 'person_one_id', 'person_two_id']);

        return response()->json([
            'members' => $this->visibility->serializeMany($members, $request->user(), withRelations: false),
            'parent_links' => $relationships->map(fn ($link) => [
                'id' => $link->id,
                'parent_id' => $link->parent_id,
                'child_id' => $link->child_id,
                'type' => $link->type,
            ]),
            'spouse_links' => $marriages->map(fn ($link) => [
                'id' => $link->id,
                'person_one_id' => $link->person_one_id,
                'person_two_id' => $link->person_two_id,
            ]),
        ]);
    }
}