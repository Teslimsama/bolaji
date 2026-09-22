<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureElder
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isElder()) {
            return response()->json(['message' => 'Family elder privileges required.'], 403);
        }

        return $next($request);
    }
}