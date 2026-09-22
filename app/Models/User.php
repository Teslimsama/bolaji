<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_MEMBER = 'member';

    public const ROLE_ELDER = 'elder';

    public const ROLE_ADMIN = 'admin';

    public function familyMember(): HasOne
    {
        return $this->hasOne(FamilyMember::class, 'user_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isElder(): bool
    {
        return in_array($this->role, [self::ROLE_ELDER, self::ROLE_ADMIN], true);
    }

    public function verifiedFamilyMember(): ?FamilyMember
    {
        $member = $this->familyMember;

        return $member && $member->status === FamilyMember::STATUS_VERIFIED ? $member : null;
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'actor_id');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}