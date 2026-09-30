<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Services\SchoolMailer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class SettingsController extends Controller
{
    public function index()
    {
        abort_if(auth('api')->user()?->must_change_password, 403, 'You must change your default password before using the portal.');

        $settings = SystemSetting::latest('id')->first();
        if (! $settings) {
            return response()->json(null);
        }

        $settings->school_logo_url = $settings->school_logo_path ? url('storage/'.$settings->school_logo_path) : null;
        $settings->about_us_image_url = $settings->about_us_image_path ? url('storage/'.$settings->about_us_image_path) : null;

        if (! auth('api')->check()) {
            return response()->json($this->onlyPublicFields($settings));
        }

        return response()->json($settings);
    }

    public function publicIndex()
    {
        $settings = SystemSetting::latest('id')->first();
        if (! $settings) {
            return response()->json(null);
        }

        $settings->school_logo_url = $settings->school_logo_path ? url('storage/'.$settings->school_logo_path) : null;
        $settings->about_us_image_url = $settings->about_us_image_path ? url('storage/'.$settings->about_us_image_path) : null;

        return response()->json($this->onlyPublicFields($settings));
    }

    private function onlyPublicFields(SystemSetting $settings): array
    {
        return $settings->only([
            'landing_school_name', 'landing_tagline', 'landing_hero_title', 'landing_hero_desc',
            'landing_address', 'contact_phone', 'contact_email', 'school_logo_url',
            'about_us_image_url', 'about_us_content', 'facebook_url', 'twitter_url', 'instagram_url',
            'ticker_text', 'ticker_speed', 'feature1_icon', 'feature1_title', 'feature1_desc',
            'feature2_icon', 'feature2_title', 'feature2_desc', 'feature3_icon', 'feature3_title',
            'feature3_desc', 'feature4_icon', 'feature4_title', 'feature4_desc',
        ]);
    }

    public function store(Request $request)
    {
        $this->requireAdmin();

        $settings = SystemSetting::latest('id')->first();
        $wasResultEntryOpen = $settings ? (bool) $settings->result_entry_open : true;
        if (! $settings) {
            $settings = new SystemSetting;
        }

        $validColumns = Schema::getColumnListing($settings->getTable());
        // Force add recently added columns to bypass any schema caching issues
        $validColumns = array_merge($validColumns, [
            'attendance_location1_name',
            'attendance_location2_name',
            'attendance_location1_lat',
            'attendance_location1_lng',
            'attendance_location2_lat',
            'attendance_location2_lng',
            'attendance_radius',
        ]);

        $data = $request->only($validColumns);
        unset($data['id'], $data['created_at'], $data['updated_at']);

        // Handle defaults based on Node backend
        $data['ca1_name'] = $request->input('ca1_name', 'CA 1');
        $data['ca2_name'] = $request->input('ca2_name', 'CA 2');
        $data['ca3_name'] = $request->input('ca3_name', 'CA 3');
        $data['ca4_name'] = $request->input('ca4_name', 'CA 4');
        $data['exam_name'] = $request->input('exam_name', 'Exam');

        $settings->fill($data);
        $settings->save();

        if ($wasResultEntryOpen && ! $settings->result_entry_open) {
            app(SchoolMailer::class)->resultEntryClosed(
                (string) $settings->active_term,
                (string) $settings->active_session
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function uploadLogo(Request $request)
    {
        $this->requireAdmin();

        $request->validate([
            'logo' => 'required|image|mimes:jpeg,jpg,png|max:250',
        ], [
            'logo.max' => 'The school logo must not be greater than 250 kilobytes.',
            'logo.mimes' => 'The school logo must be a file of type: jpeg, jpg, png.',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');

            $settings = SystemSetting::latest('id')->first();
            if (! $settings) {
                $settings = new SystemSetting;
            }
            $settings->school_logo_path = $path;
            $settings->save();

            return response()->json([
                'message' => 'Logo uploaded successfully',
                'school_logo_url' => url('storage/'.$path),
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }

    public function uploadAboutUsImage(Request $request)
    {
        $this->requireAdmin();

        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048',
        ], [
            'image.max' => 'The about us image must not be greater than 2MB.',
            'image.mimes' => 'The about us image must be a file of type: jpeg, jpg, png, webp.',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('landing', 'public');

            $settings = SystemSetting::latest('id')->first();
            if (! $settings) {
                $settings = new SystemSetting;
            }
            $settings->about_us_image_path = $path;
            $settings->save();

            return response()->json([
                'message' => 'Image uploaded successfully',
                'about_us_image_url' => url('storage/'.$path),
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }
}
