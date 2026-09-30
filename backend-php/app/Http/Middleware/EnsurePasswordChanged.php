<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth('api')->user()?->must_change_password) {
            return response()->json([
                'message' => 'You must change your default password before using the portal.',
                'must_change_password' => true,
            ], 403);
        }

        return $next($request);
    }
}
