<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\Interfaces\AppointmentRepositoryInterface::class,
            \App\Repositories\Eloquent\AppointmentRepository::class
        );

        $this->app->bind(
            \App\Repositories\Interfaces\ProductRepositoryInterface::class,
            \App\Repositories\Eloquent\ProductRepository::class
        );

        $this->app->bind(
            \App\Repositories\Interfaces\GiftRequestRepositoryInterface::class,
            \App\Repositories\Eloquent\GiftRequestRepository::class
        );

        $this->app->bind(
            \App\Repositories\Interfaces\CustomerProfileRepositoryInterface::class,
            \App\Repositories\Eloquent\CustomerProfileRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\AppointmentCreated::class,
            \App\Listeners\SendTelegramNotification::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\GiftRequestCreated::class,
            \App\Listeners\SendTelegramNotification::class
        );
    }
}
