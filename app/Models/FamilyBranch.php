<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description', 'parent_branch_id'])]
class FamilyBranch extends Model
{
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_branch_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(FamilyMember::class, 'family_branch_id');
    }
}