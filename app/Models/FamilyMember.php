<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'user_id', 'first_name', 'last_name', 'gender', 'family_branch_id',
    'photo_path', 'occupation', 'bio', 'phone', 'email', 'dob',
    'status', 'created_by', 'verified_by', 'verified_at',
])]
#[Hidden(['user_id'])]
class FamilyMember extends Model
{
    use SoftDeletes;

    public const STATUS_PENDING = 'pending';

    public const STATUS_VERIFIED = 'verified';

    public const STATUS_REJECTED = 'rejected';

    public const GENDER_MALE = 'male';

    public const GENDER_FEMALE = 'female';

    public const GENDER_OTHER = 'other';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(FamilyBranch::class, 'family_branch_id');
    }

    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'family_relationships', 'child_id', 'parent_id')
            ->withPivot(['type', 'status'])
            ->wherePivot('status', 'active')
            ->wherePivot('type', 'biological');
    }

    public function allParents(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'family_relationships', 'child_id', 'parent_id')
            ->withPivot(['type', 'status'])
            ->wherePivot('status', 'active');
    }

    public function children(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'family_relationships', 'parent_id', 'child_id')
            ->withPivot(['type', 'status'])
            ->wherePivot('status', 'active');
    }

    public function descendants(): HasMany
    {
        return $this->hasMany(self::class, 'created_by');
    }

    public function spouses(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'marriages', 'person_one_id', 'person_two_id')
            ->withPivot(['status', 'verified_at']);
    }

    public function reverseSpouses(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'marriages', 'person_two_id', 'person_one_id')
            ->withPivot(['status', 'verified_at']);
    }

    public function marriagesAsOne(): HasMany
    {
        return $this->hasMany(Marriage::class, 'person_one_id');
    }

    public function marriagesAsTwo(): HasMany
    {
        return $this->hasMany(Marriage::class, 'person_two_id');
    }

    public function privacySettings(): HasMany
    {
        return $this->hasMany(PrivacySetting::class, 'family_member_id');
    }

    public function verificationRequests(): HasMany
    {
        return $this->hasMany(VerificationRequest::class, 'family_member_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class, 'family_member_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    public function isVerified(): bool
    {
        return $this->status === self::STATUS_VERIFIED;
    }
}