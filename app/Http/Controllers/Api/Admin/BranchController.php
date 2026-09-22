<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BranchRequest;
use App\Models\FamilyBranch;
use App\Models\FamilyMember;
use App\Services\AuditService;
use App\Services\MemberVisibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    public function __construct(private readonly MemberVisibilityService $visibility) {}

    public function index(): JsonResponse
    {
        $branches = FamilyBranch::withCount('members')->with('parent:id,name')->orderBy('name')->get();

        return response()->json([
            'branches' => $branches->map(fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'slug' => $branch->slug,
                'description' => $branch->description,
                'parent_id' => $branch->parent_branch_id,
                'parent_name' => $branch->parent?->name,
                'member_count' => $branch->members_count,
            ]),
        ]);
    }

    public function store(BranchRequest $request): JsonResponse
    {
        $branch = FamilyBranch::create([
            'name' => $request->input('name'),
            'slug' => $request->input('slug') ?? Str::slug($request->input('name')),
            'description' => $request->input('description'),
            'parent_branch_id' => $request->input('parent_branch_id'),
        ]);

        AuditService::forRequest($request, 'branch.created', FamilyBranch::class, $branch->id);

        return response()->json(['branch' => $branch], 201);
    }

    public function update(BranchRequest $request, int $id): JsonResponse
    {
        $branch = FamilyBranch::findOrFail($id);
        $branch->update($request->only(['name', 'description', 'parent_branch_id']));

        AuditService::forRequest($request, 'branch.updated', FamilyBranch::class, $branch->id);

        return response()->json(['branch' => $branch->fresh()]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $branch = FamilyBranch::findOrFail($id);

        if (FamilyMember::where('family_branch_id', $branch->id)->exists()) {
            abort(422, 'This branch still has members assigned to it.');
        }

        $branch->delete();

        AuditService::forRequest($request, 'branch.deleted', FamilyBranch::class, $id);

        return response()->json(['message' => 'Branch deleted.']);
    }
}