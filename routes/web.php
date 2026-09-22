<?php

use App\Http\Middleware\NoIndex;
use Illuminate\Support\Facades\Route;

Route::middleware(NoIndex::class)->get('/{any}', function () {
    return view('app');
})->where('any', '.*');