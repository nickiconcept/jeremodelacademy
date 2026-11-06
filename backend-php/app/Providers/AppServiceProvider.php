<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Per account + IP, so one shared school/carrier IP cannot lock everyone out.
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(10)
            ->by($request->ip().'|'.strtolower((string) $request->input('identifier'))));

        // Session restore is keyed by user, falling back to IP when unauthenticated.
        RateLimiter::for('session', fn (Request $request) => Limit::perMinute(30)
            ->by($request->user('api')?->id ?: $request->ip()));
    }
}
