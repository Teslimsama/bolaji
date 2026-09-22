<?php

use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\BranchController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\TreeAdminController;
use App\Http\Controllers\Api\Admin\VerificationRequestController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FamilyEventController;
use App\Http\Controllers\Api\FamilyMemberController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\PrivacyController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\RelationshipController;
use App\Http\Controllers\Api\TreeController;
use Illuminate\Support\Facades\Route;

// ---------- Public (unauthenticated) ----------
Route::get('/', [PublicController::class, 'home']);
Route::get('/about', [PublicController::class, 'home']);
Route::get('/branches', [PublicController::class, 'branches']);
Route::post('/request-access', [PublicController::class, 'requestAccess'])->middleware('throttle:5,1');

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/events', [FamilyEventController::class, 'index']);

// ---------- Authenticated ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Own privacy control
    Route::get('/privacy', [PrivacyController::class, 'index']);
    Route::put('/privacy', [PrivacyController::class, 'update']);

    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::get('/media/member/{member_id}', [MediaController::class, 'index'])->name('media.by_member');

    // Photo serving (visibility-checked)
    Route::get('/media/serve/{member}/photo', [FamilyMemberController::class, 'servePhoto'])->name('photo.serve');

    // ---------- Verified registry ----------
    Route::middleware('verified.member')->group(function () {
        Route::get('/members', [FamilyMemberController::class, 'index']);
        Route::get('/members/{id}/profile', [FamilyMemberController::class, 'profile']);
        Route::get('/tree', [TreeController::class, 'index']);

        Route::get('/me/relationship/{memberId}', [RelationshipController::class, 'lookup']);

        // Own profile editing
        Route::put('/members/{id}', [FamilyMemberController::class, 'update']);
        Route::post('/members/{id}/photo', [FamilyMemberController::class, 'uploadPhoto']);
    });

    // ---------- Elders / Admins ----------
    Route::middleware('family.elder')->group(function () {
        Route::get('/verifications', [VerificationRequestController::class, 'index']);
        Route::get('/verifications/{id}', [VerificationRequestController::class, 'show']);
        Route::post('/verifications/{id}/review', [VerificationRequestController::class, 'review']);

        Route::post('/relationships', [TreeAdminController::class, 'link']);
        Route::delete('/relationships', [TreeAdminController::class, 'unlink']);
        Route::post('/marriages', [TreeAdminController::class, 'marry']);
        Route::delete('/marriages', [TreeAdminController::class, 'divorce']);

        Route::get('/compare', [RelationshipController::class, 'compare']);
    });

    // ---------- Admins ----------
    Route::middleware('family.admin')->group(function () {
        Route::get('/admin/dashboard', [DashboardController::class, 'index']);

        Route::get('/branches', [BranchController::class, 'index']);
        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{id}', [BranchController::class, 'update']);
        Route::delete('/branches/{id}', [BranchController::class, 'destroy']);

        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

        Route::post('/events', [FamilyEventController::class, 'store']);
        Route::put('/events/{id}', [FamilyEventController::class, 'update']);
        Route::delete('/events/{id}', [FamilyEventController::class, 'destroy']);

        Route::get('/admin/audit-logs', [AuditLogController::class, 'index']);
    });
});