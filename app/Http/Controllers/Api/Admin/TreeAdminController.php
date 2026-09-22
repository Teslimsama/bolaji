<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LinkMemberRequest;
use App\Http\Requests\MarriageRequest;
use App\Models\FamilyRelationship;
use App\Models\Marriage;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TreeAdminController extends Controller
{
    public function link(LinkMemberRequest $request): JsonResponse
    {
        $relationship = FamilyRelationship::updateOrCreate(
            [
                'parent_id' => $request->input('parent_id'),
                'child_id' => $request->input('child_id'),
            ],
            [
                'type' => $request->input('type', 'biological'),
                'status' => 'active',
            ],
        );

        AuditService::forRequest($request, 'relationship.created', FamilyRelationship::class, $relationship->id, $request->only(['parent_id', 'child_id', 'type']));

        return response()->json(['relationship' => $relationship], 201);
    }

    public function unlink(Request $request): JsonResponse
    {
        $data = $request->validate([
            'parent_id' => ['required', 'integer', 'exists:family_members,id'],
            'child_id' => ['required', 'integer', 'exists:family_members,id'],
        ]);

        $deleted = FamilyRelationship::where('parent_id', $data['parent_id'])
            ->where('child_id', $data['child_id'])
            ->delete();

        AuditService::forRequest($request, 'relationship.deleted', FamilyRelationship::class, null, $data);

        return response()->json(['message' => $deleted ? 'Relationship removed.' : 'Relationship not found.']);
    }

    public function marry(MarriageRequest $request): JsonResponse
    {
        [$a, $b] = [$request->input('person_one_id'), $request->input('person_two_id')];

        $marriage = Marriage::whereIn('person_one_id', [$a, $b])->whereIn('person_two_id', [$a, $b])->first()
            ?? new Marriage(['person_one_id' => $a, 'person_two_id' => $b]);

        if (! $marriage->exists) {
            $marriage->fill([
                'person_one_id' => $a,
                'person_two_id' => $b,
                'status' => $request->input('status', 'married'),
            ])->save();
        } else {
            $marriage->update(['status' => $request->input('status', 'married')]);
        }

        AuditService::forRequest($request, 'marriage.saved', Marriage::class, $marriage->id, $request->only(['person_one_id', 'person_two_id', 'status']));

        return response()->json(['marriage' => $marriage], 201);
    }

    public function divorce(Request $request): JsonResponse
    {
        $data = $request->validate([
            'person_one_id' => ['required', 'integer', 'exists:family_members,id'],
            'person_two_id' => ['required', 'integer', 'exists:family_members,id'],
        ]);

        $marriage = Marriage::whereIn('person_one_id', [$data['person_one_id'], $data['person_two_id']])
            ->whereIn('person_two_id', [$data['person_one_id'], $data['person_two_id']])
            ->first();

        if ($marriage) {
            $marriage->update(['status' => 'divorced']);
            AuditService::forRequest($request, 'marriage.divorced', Marriage::class, $marriage->id, $data);

            return response()->json(['message' => 'Marriage marked as divorced.']);
        }

        return response()->json(['message' => 'Marriage not found.'], 404);
    }
}