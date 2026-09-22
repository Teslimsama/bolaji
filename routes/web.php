<?php

use App\Http\Middleware\NoIndex;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(NoIndex::class)->group(function () {
    Route::get('/', fn () => Inertia::render('Home'));
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'));
    Route::get('/tree', fn () => Inertia::render('Tree'));
    Route::get('/find', fn () => Inertia::render('Find'));
    Route::get('/admin', fn () => Inertia::render('AdminQueue'));
    Route::get('/login', fn () => Inertia::render('Login'));
    Route::get('/request-access', fn () => Inertia::render('Auth/RequestAccessPage'));
    Route::get('/me', fn () => Inertia::render('Auth/ProfilePage'));
    Route::get('/me/verify', fn () => Inertia::render('Auth/VerifyStatusPage'));

    Route::get('/{any}', fn () => view('app'))->where('any', '.*');
});