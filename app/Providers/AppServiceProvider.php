<?php

namespace App\Providers;

use App\Models\ClassSubject;
use App\Observers\ClassSubjectObserver;
use Illuminate\Support\Facades\Vite;
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
        Vite::prefetch(concurrency: 3);
        
        // Register model observers
        ClassSubject::observe(ClassSubjectObserver::class);
    }
}
