<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, int $maxAttempts = 60, int $decayMinutes = 1): Response
    {
        $key = $this->resolveRequestSignature($request);

        if (Cache::has($key)) {
            $attempts = Cache::get($key);
            
            if ($attempts >= $maxAttempts) {
                return response()->json([
                    'success' => false,
                    'message' => 'Слишком много запросов. Пожалуйста, попробуйте позже.'
                ], 429);
            }
            
            Cache::put($key, $attempts + 1, now()->addMinutes($decayMinutes));
        } else {
            Cache::put($key, 1, now()->addMinutes($decayMinutes));
        }

        return $next($request);
    }

    /**
     * Resolve request signature.
     */
    protected function resolveRequestSignature(Request $request): string
    {
        if ($user = $request->user()) {
            return sha1($user->getAuthIdentifier());
        }

        return sha1($request->ip() . '|' . $request->userAgent());
    }
}
