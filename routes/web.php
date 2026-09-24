<?php

use App\Http\Middleware\NoIndex;
use App\Models\FamilyBranch;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(NoIndex::class)->group(function () {
    Route::get('/', fn () => Inertia::render('Home'));
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'));
    Route::get('/tree', fn () => Inertia::render('Tree', ['tree' => []]));
    Route::get('/find', fn () => Inertia::render('Find'));
    Route::get('/admin/queue', fn () => Inertia::render('AdminQueue', ['requests' => []]));
    Route::get('/login', fn () => Inertia::render('Auth/Login'));
    Route::get('/request-access', fn () => Inertia::render('Auth/RequestAccess', [
        'branches' => FamilyBranch::query()->orderBy('name')->get(['id', 'name'])->map(fn ($b) => ['id' => $b->id, 'name' => $b->name])->values()->all(),
    ]));
    Route::get('/me/verify', fn () => Inertia::render('Auth/VerifyStatus', ['status' => null]));
    Route::get('/me', fn () => Inertia::render('Auth/Profile', ['member' => null]));

    Route::get('/{any}', fn () => view('app'))->where('any', '.*');
});