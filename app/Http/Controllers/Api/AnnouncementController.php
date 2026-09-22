<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnnouncementRequest;
use App\Models\Announcement;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Public-only announcements (unauthenticated) and family announcements
     * (verified members / elders).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::with('author:id,name')->orderByDesc('published_at');

        if ($request->user()) {
            $query->where(function ($q) {
                $q->where('visibility', 'public')->orWhere('visibility', 'family');
            });
        } else {
            $query->where('visibility', 'public')->whereNotNull('published_at');
        }

        return response()->json([
            'announcements' => $query->limit(50)->get(['id', 'title', 'body', 'visibility', 'author_id', 'published_at']),
        ]);
    }

    public function store(AnnouncementRequest $request): JsonResponse
    {
        $announcement = Announcement::create([
            'title' => $request->input('title'),
            'body' => $request->input('body'),
            'author_id' => $request->user()->id,
            'visibility' => $request->input('visibility', 'family'),
            'published_at' => $request->filled('published_at') ? $request->input('published_at') : now(),
        ]);

        AuditService::forRequest($request, 'announcement.created', Announcement::class, $announcement->id);

        return response()->json(['announcement' => $announcement], 201);
    }

    public function update(AnnouncementRequest $request, int $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->update($request->only(['title', 'body', 'visibility', 'published_at']));

        AuditService::forRequest($request, 'announcement.updated', Announcement::class, $announcement->id);

        return response()->json(['announcement' => $announcement->fresh()]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        AuditService::forRequest($request, 'announcement.deleted', Announcement::class, $id);

        return response()->json(['message' => 'Announcement deleted.']);
    }
}