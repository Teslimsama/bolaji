<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'family_member_id', 'claimed_relationship_type', 'claimed_related_to_id',
    'submitted_by', 'notes', 'status', 'reviewed_by', 'reviewed_at',
])]
class VerificationRequest extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_MORE_INFO = 'more_info';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public function familyMember(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'family_member_id');
    }

    public function claimedRelatedTo(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'claimed_related_to_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}