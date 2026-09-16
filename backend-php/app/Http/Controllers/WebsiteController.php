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
        $settings = SystemSetting::latest('id')->first() ?: new SystemSetting();
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
            'caption' => 'nullable|string'
        ]);

        if (!$request->hasFile('image') || !$request->file('image')->isValid()) {
            return response()->json(['errors' => ['image' => ['The image field is required and must be a valid upload.']]], 422);
        }

        $file = $request->file('image');
        
        if ($file->getSize() > 2048 * 1024) {
            return response()->json(['errors' => ['image' => ['The image must not be greater than 2048 kilobytes.']]], 422);
        }

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $allowedExtensions)) {
            return response()->json(['errors' => ['image' => ['The uploaded file must be a valid image (jpg, jpeg, png, gif, webp).']]], 422);
        }

        $filename = uniqid('slide_') . '.' . $extension;
        $path = $file->storeAs('slides', $filename, 'public');
        
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
        $settings = SystemSetting::latest('id')->first();
        if (!$settings) $settings = new SystemSetting();

        $data = $request->only(['facebook_url', 'twitter_url', 'instagram_url']);
        $settings->fill($data);
        $settings->save();

        return response()->json(['message' => 'Social links updated', 'settings' => $settings]);
    }

    public function updateAboutUs(Request $request)
    {
        $settings = SystemSetting::latest('id')->first();
        if (!$settings) $settings = new SystemSetting();

        $settings->about_us_content = $request->input('about_us_content');
        $settings->save();

        return response()->json(['message' => 'About Us updated', 'settings' => $settings]);
    }

    public function updateSchoolInfo(Request $request)
    {
        $settings = SystemSetting::latest('id')->first();
        if (!$settings) $settings = new SystemSetting();

        $allowed = [
            'landing_school_name', 'landing_tagline', 'landing_address', 'contact_phone', 'contact_email', 'landing_hero_desc', 'ticker_text', 'ticker_speed',
            'feature1_icon', 'feature1_title', 'feature1_desc',
            'feature2_icon', 'feature2_title', 'feature2_desc',
            'feature3_icon', 'feature3_title', 'feature3_desc',
            'feature4_icon', 'feature4_title', 'feature4_desc',
        ];
        foreach ($allowed as $key) {
            if ($request->has($key)) {
                $settings->$key = $request->input($key);
            }
        }
        $settings->save();

        return response()->json(['message' => 'School info updated', 'settings' => $settings]);
    }
}
