<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\AuditService;
use App\Services\MemberVisibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly MemberVisibilityService $visibility) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $user = \App\Models\User::with('familyMember')->where('email', $request->input('email'))->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages(['email' => ['These credentials do not match our records.']]);
        }

        if ($user->status === 'suspended') {
            throw ValidationException::withMessages(['email' => ['This account has been suspended.']]);
        }

        $token = $user->createToken('registry')->plainTextToken;

        AuditService::forRequest($request, 'auth.login', \App\Models\User::class, $user->id);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'member' => $user->familyMember
                    ? $this->visibility->serializeOne($user->familyMember, $user->familyMember->privacySettings, $user, true)
                    : null,
                'can_access_registry' => $this->canAccessRegistry($user),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('familyMember');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'member' => $user->familyMember
                    ? $this->visibility->serializeOne($user->familyMember, $user->familyMember->privacySettings, $user, true)
                    : null,
                'can_access_registry' => $this->canAccessRegistry($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        AuditService::forRequest($request, 'auth.logout', \App\Models\User::class, $request->user()->id);
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Signed out.']);
    }

    private function canAccessRegistry(\App\Models\User $user): bool
    {
        if ($user->isElder()) {
            return true;
        }

        return (bool) $user->verifiedFamilyMember();
    }
}