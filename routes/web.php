<?php

use App\Http\Controllers\PreviewPhotoController;
use App\Http\Middleware\NoIndex;
use Illuminate\Support\Facades\Route;

Route::middleware(NoIndex::class)->group(function () {
    Route::get('/preview/photo/{member}', [PreviewPhotoController::class, 'show']);
    Route::get('/{any}', fn () => view('app'))->where('any', '.*');
});