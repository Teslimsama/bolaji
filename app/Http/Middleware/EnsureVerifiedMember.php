<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVerifiedMember
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Authentication required.'], 401);
        }

        if ($user->isElder()) {
            return $next($request);
        }

        $member = $user->familyMember;

        if (! $member || $member->status !== 'verified') {
            return response()->json([
                'message' => 'Your family membership must be verified before you can access the registry.',
                'state' => 'pending_verification',
            ], 403);
        }

        return $next($request);
    }
}