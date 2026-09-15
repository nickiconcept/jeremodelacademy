<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Slide;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Storage;

class WebsiteController extends Controller
{
    // Public endpoint for Landing Page
    public function getPublicData()
    {
        $settings = SystemSetting::first() ?: new SystemSetting();
        $slides = Slide::orderBy('order_index', 'asc')->orderBy('id', 'desc')->get();
        
        return response()->json([
            'about_us_content' => $settings->about_us_content,
            'facebook_url' => $settings->facebook_url,
            'twitter_url' => $settings->twitter_url,
            'instagram_url' => $settings->instagram_url,
            'slides' => $slides
        ]);
    }

    public function getSlides()
    {
        return response()->json(Slide::orderBy('order_index', 'asc')->get());
    }

    public function storeSlide(Request $request)
    {
        $request->validate([
            'image' => 'required|file|max:2048',
            'caption' => 'nullable|string'
        ]);

        $path = $request->file('image')->store('slides', 'public');
        
        $slide = Slide::create([
            'image_url' => url('storage/' . $path),
            'caption' => $request->caption,
            'order_index' => Slide::max('order_index') + 1
        ]);

        return response()->json(['message' => 'Slide added', 'slide' => $slide]);
    }

    public function deleteSlide($id)
    {
        $slide = Slide::findOrFail($id);
        if ($slide->image_url) {
            $path = str_replace(url('storage') . '/', '', $slide->image_url);
            Storage::disk('public')->delete($path);
        }
        $slide->delete();
        return response()->json(['message' => 'Slide deleted']);
    }

    public function updateSocialLinks(Request $request)
    {
        $settings = SystemSetting::first();
        if (!$settings) $settings = new SystemSetting();

        $data = $request->only(['facebook_url', 'twitter_url', 'instagram_url']);
        $settings->fill($data);
        $settings->save();

        return response()->json(['message' => 'Social links updated', 'settings' => $settings]);
    }

    public function updateAboutUs(Request $request)
    {
        $settings = SystemSetting::first();
        if (!$settings) $settings = new SystemSetting();

        $settings->about_us_content = $request->input('about_us_content');
        $settings->save();

        return response()->json(['message' => 'About Us updated', 'settings' => $settings]);
    }

    public function updateSchoolInfo(Request $request)
    {
        $settings = SystemSetting::first();
        if (!$settings) $settings = new SystemSetting();

        $allowed = ['landing_school_name', 'landing_tagline', 'landing_address', 'landing_phone', 'landing_email', 'landing_hero_desc'];
        foreach ($allowed as $key) {
            if ($request->has($key)) {
                $settings->$key = $request->input($key);
            }
        }
        $settings->save();

        return response()->json(['message' => 'School info updated', 'settings' => $settings]);
    }
}
