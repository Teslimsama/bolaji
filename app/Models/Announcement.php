<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'body', 'author_id', 'visibility', 'published_at'])]
class Announcement extends Model
{
    public const VIS_PUBLIC = 'public';

    public const VIS_FAMILY = 'family';

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}