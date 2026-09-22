<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['parent_id', 'child_id', 'type', 'status'])]
class FamilyRelationship extends Model
{
    public function parent(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'parent_id');
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'child_id');
    }
}