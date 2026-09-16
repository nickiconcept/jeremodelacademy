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
            'event_date' => 'required|date'
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            
            if (!$file->isValid()) {
                return response()->json(['errors' => ['image' => ['The image failed to upload.']]], 422);
            }
            if ($file->getSize() > 1024 * 1024) {
                return response()->json(['errors' => ['image' => ['The image must not be greater than 1024 kilobytes.']]], 422);
            }

            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $extension = strtolower($file->getClientOriginalExtension());
            if (!in_array($extension, $allowedExtensions)) {
                return response()->json(['errors' => ['image' => ['The uploaded file must be a valid image.']]], 422);
            }
        }

        $data = $request->only(['title', 'description', 'event_date']);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = uniqid('event_') . '.' . strtolower($file->getClientOriginalExtension());
            $path = $file->storeAs('events', $filename, 'public');
            $data['image_url'] = url('storage/' . $path);
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
            'event_date' => 'required|date'
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            
            if (!$file->isValid()) {
                return response()->json(['errors' => ['image' => ['The image failed to upload.']]], 422);
            }
            if ($file->getSize() > 1024 * 1024) {
                return response()->json(['errors' => ['image' => ['The image must not be greater than 1024 kilobytes.']]], 422);
            }

            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $extension = strtolower($file->getClientOriginalExtension());
            if (!in_array($extension, $allowedExtensions)) {
                return response()->json(['errors' => ['image' => ['The uploaded file must be a valid image.']]], 422);
            }
        }

        $data = $request->only(['title', 'description', 'event_date']);

        if ($request->hasFile('image')) {
            if ($event->image_url) {
                $oldPath = str_replace(url('storage') . '/', '', $event->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $file = $request->file('image');
            $filename = uniqid('event_') . '.' . strtolower($file->getClientOriginalExtension());
            $path = $file->storeAs('events', $filename, 'public');
            $data['image_url'] = url('storage/' . $path);
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
