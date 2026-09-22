<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'event_date', 'description', 'location', 'visibility', 'created_by'])]
class FamilyEvent extends Model
{
    public const VIS_PUBLIC = 'public';

    public const VIS_FAMILY = 'family';

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}