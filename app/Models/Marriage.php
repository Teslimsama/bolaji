<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['person_one_id', 'person_two_id', 'status', 'verified_by', 'verified_at'])]
class Marriage extends Model
{
    public function personOne(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'person_one_id');
    }

    public function personTwo(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'person_two_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}