<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FamilyEventRequest;
use App\Models\FamilyEvent;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamilyEventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FamilyEvent::orderBy('event_date');

        if (! $request->user()) {
            $query->where('visibility', 'public')->where('event_date', '>=', now()->toDateString());
        }

        return response()->json([
            'events' => $query->limit(100)->get(['id', 'title', 'event_date', 'description', 'location', 'visibility', 'created_by']),
        ]);
    }

    public function store(FamilyEventRequest $request): JsonResponse
    {
        $event = FamilyEvent::create([
            'title' => $request->input('title'),
            'event_date' => $request->input('event_date'),
            'description' => $request->input('description'),
            'location' => $request->input('location'),
            'visibility' => $request->input('visibility', 'family'),
            'created_by' => $request->user()->id,
        ]);

        AuditService::forRequest($request, 'event.created', FamilyEvent::class, $event->id);

        return response()->json(['event' => $event], 201);
    }

    public function update(FamilyEventRequest $request, int $id): JsonResponse
    {
        $event = FamilyEvent::findOrFail($id);
        $event->update($request->only(['title', 'event_date', 'description', 'location', 'visibility']));

        AuditService::forRequest($request, 'event.updated', FamilyEvent::class, $event->id);

        return response()->json(['event' => $event->fresh()]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $event = FamilyEvent::findOrFail($id);
        $event->delete();

        AuditService::forRequest($request, 'event.deleted', FamilyEvent::class, $id);

        return response()->json(['message' => 'Event deleted.']);
    }
}