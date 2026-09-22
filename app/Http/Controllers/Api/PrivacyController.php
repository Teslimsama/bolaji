<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePrivacyRequest;
use App\Models\PrivacySetting;
use App\Services\AuditService;
use App\Services\MemberVisibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrivacyController extends Controller
{
    public function __construct(private readonly MemberVisibilityService $visibility) {}

    public function index(Request $request): JsonResponse
    {
        $member = $request->user()->familyMember;

        abort_if(! $member, 404, 'No family profile attached to this account.');

        $current = $member->privacySettings->pluck('visibility', 'field_name');

        $result = [];
        foreach (PrivacySetting::FIELDS as $field) {
            $result[$field] = $current[$field] ?? 'family';
        }

        return response()->json(['settings' => $result]);
    }

    public function update(UpdatePrivacyRequest $request): JsonResponse
    {
        $member = $request->user()->familyMember;

        abort_if(! $member, 404, 'No family profile attached to this account.');

        foreach ($request->input('settings') as $setting) {
            PrivacySetting::updateOrCreate(
                ['family_member_id' => $member->id, 'field_name' => $setting['field_name']],
                ['visibility' => $setting['visibility']],
            );
        }

        AuditService::forRequest($request, 'privacy.updated', \App\Models\FamilyMember::class, $member->id, [
            'settings' => collect($request->input('settings'))->pluck('visibility', 'field_name')->all(),
        ]);

        return response()->json([
            'settings' => $this->memberSettings($member),
            'member' => $this->visibility->serializeOne($member->fresh(['privacySettings']), $member->privacySettings, $request->user(), true),
        ]);
    }

    private function memberSettings(\App\Models\FamilyMember $member): array
    {
        $current = $member->privacySettings->pluck('visibility', 'field_name');
        $result = [];
        foreach (PrivacySetting::FIELDS as $field) {
            $result[$field] = $current[$field] ?? 'family';
        }

        return $result;
    }
}