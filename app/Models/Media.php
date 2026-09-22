<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['family_member_id', 'file_path', 'type', 'visibility', 'uploaded_by', 'caption'])]
class Media extends Model
{
    public const VIS_PUBLIC = 'public';

    public const VIS_FAMILY = 'family';

    public const VIS_PRIVATE = 'private';

    public function familyMember(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'family_member_id');
    }
}