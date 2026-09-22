<?php

namespace App\Services;

use App\Models\FamilyMember;
use App\Models\PrivacySetting;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class MemberVisibilityService
{
    /**
     * Serialize a member for a given viewer, applying server-side field-level
     * visibility. Fields marked private are only visible to the member themselves
     * (or elders/admins). Family fields are visible to any verified member.
     *
     * @param  Collection<int, FamilyMember>  $members
     * @return array|array<int, array<string, mixed>>
     */
    public function serializeMany(Collection $members, ?User $viewer, bool $withRelations = false): array
    {
        $memberIds = $members->pluck('id')->all();
        $settings = PrivacySetting::whereIn('family_member_id', $memberIds)->get()->groupBy('family_member_id');

        return $members->map(
            fn (FamilyMember $member) => $this->serializeOne($member, $settings->get($member->id, collect()), $viewer, $withRelations)
        )->values()->all();
    }

    /**
     * @param  \Illuminate\Support\Collection<int, PrivacySetting>  $settings
     * @return array<string, mixed>
     */
    public function serializeOne(FamilyMember $member, $settings, ?User $viewer, bool $withRelations = false): array
    {
        $self = $viewer && $viewer->id === $member->user_id;
        $isElder = $viewer?->isElder() ?? false;

        $result = [
            'id' => $member->id,
            'first_name' => $member->first_name,
            'last_name' => $member->last_name,
            'full_name' => $member->full_name,
            'gender' => $member->gender,
            'status' => $member->status,
            'is_verified' => $member->isVerified(),
            'branch_id' => $member->family_branch_id,
            'photo_path' => $this->visibleOrNull('photo', $member->photo_path, $settings, $self, $isElder),
        ];

        if ($withRelations) {
            $result['occupation'] = $this->visibleOrNull('occupation', $member->occupation, $settings, $self, $isElder);
            $result['bio'] = $this->visibleOrNull('bio', $member->bio, $settings, $self, $isElder);
            $result['phone'] = $this->visibleOrNull('phone', $member->phone, $settings, $self, $isElder);
            $result['email'] = $this->visibleOrNull('email', $member->email, $settings, $self, $isElder);
            $result['dob'] = $this->visibleOrNull('dob', optional($member->dob)->toDateString(), $settings, $self, $isElder);
        }

        if ($self || $isElder) {
            $result['is_self'] = true;
        }

        $result['is_self'] = $self;

        return $result;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, PrivacySetting>  $settings
     */
    private function visibleOrNull(string $field, mixed $value, $settings, bool $self, bool $isElder): mixed
    {
        if ($value === null) {
            return null;
        }

        $setting = $settings->firstWhere('field_name', $field);
        $visibility = $setting?->visibility ?? PrivacySetting::VIS_FAMILY;

        if ($visibility === PrivacySetting::VIS_PRIVATE && ! $self && ! $isElder) {
            return null;
        }

        return $value;
    }

    /**
     * Public digest of a member for the public-facing landing content — only name
     * pieces explicitly marked public. Currently unused beyond name-level teasers.
     *
     * @return array<string, mixed>
     */
    public function publicTeaser(FamilyMember $member): array
    {
        $publicFields = $member->privacySettings->where('visibility', PrivacySetting::VIS_PUBLIC)->pluck('field_name');

        return [
            'id' => $member->id,
            'full_name' => $publicFields->contains('name') ? $member->full_name : null,
            'photo_path' => $publicFields->contains(PrivacySetting::FIELD_PHOTO) ? $member->photo_path : null,
        ];
    }
}