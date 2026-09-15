<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index()
    {
        return response()->json(Event::orderBy('event_date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'event_date' => 'required|date',
            'image' => 'nullable|file|max:1024'
        ]);

        $data = $request->only(['title', 'description', 'event_date']);

        if ($request->hasFile('image')) {
            $data['image_url'] = url('storage/' . $request->file('image')->store('events', 'public'));
        }

        $event = Event::create($data);
        return response()->json(['message' => 'Event created successfully', 'event' => $event]);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        
        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'event_date' => 'required|date',
            'image' => 'nullable|file|max:1024'
        ]);

        $data = $request->only(['title', 'description', 'event_date']);

        if ($request->hasFile('image')) {
            // Delete old
            if ($event->image_url) {
                $path = str_replace(url('storage') . '/', '', $event->image_url);
                Storage::disk('public')->delete($path);
            }
            $data['image_url'] = url('storage/' . $request->file('image')->store('events', 'public'));
        }

        $event->update($data);
        return response()->json(['message' => 'Event updated successfully', 'event' => $event]);
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        if ($event->image_url) {
            $path = str_replace(url('storage') . '/', '', $event->image_url);
            Storage::disk('public')->delete($path);
        }
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }
}
