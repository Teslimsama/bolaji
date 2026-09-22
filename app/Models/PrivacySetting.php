<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['family_member_id', 'field_name', 'visibility'])]
class PrivacySetting extends Model
{
    public const VIS_PUBLIC = 'public';

    public const VIS_FAMILY = 'family';

    public const VIS_PRIVATE = 'private';

    public const FIELD_PHOTO = 'photo';

    public const FIELD_PHONE = 'phone';

    public const FIELD_EMAIL = 'email';

    public const FIELD_DOB = 'dob';

    public const FIELD_OCCUPATION = 'occupation';

    public const FIELD_BIO = 'bio';

    public const FIELDS = [
        self::FIELD_PHOTO,
        self::FIELD_PHONE,
        self::FIELD_EMAIL,
        self::FIELD_DOB,
        self::FIELD_OCCUPATION,
        self::FIELD_BIO,
    ];

    public function familyMember(): BelongsTo
    {
        return $this->belongsTo(FamilyMember::class, 'family_member_id');
    }
}