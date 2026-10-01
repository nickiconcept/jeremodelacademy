<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Services\SchoolMailer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

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
            $settings = $this->newSettingsWithAcademicDefaults();
        }

        $validatedGeofenceSettings = $request->validate([
            'attendance_geofencing_enabled' => ['sometimes', 'boolean'],
            'attendance_location1_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'attendance_location1_lat' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'attendance_location1_lng' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'attendance_location2_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'attendance_location2_lat' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'attendance_location2_lng' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'attendance_radius' => ['sometimes', 'nullable', 'integer', 'min:25', 'max:5000'],
        ]);

        $location1Lat = $request->input('attendance_location1_lat', $settings->attendance_location1_lat);
        $location1Lng = $request->input('attendance_location1_lng', $settings->attendance_location1_lng);
        $location2Lat = $request->input('attendance_location2_lat', $settings->attendance_location2_lat);
        $location2Lng = $request->input('attendance_location2_lng', $settings->attendance_location2_lng);
        $location1Complete = filled($location1Lat) && filled($location1Lng);
        $location2Complete = filled($location2Lat) && filled($location2Lng);

        if (filled($location1Lat) !== filled($location1Lng)) {
            throw ValidationException::withMessages([
                'attendance_location1_lat' => 'Enter both latitude and longitude for the permanent site.',
            ]);
        }

        if (filled($location2Lat) !== filled($location2Lng)) {
            throw ValidationException::withMessages([
                'attendance_location2_lat' => 'Enter both latitude and longitude for the temporary site.',
            ]);
        }

        $geofencingEnabled = array_key_exists('attendance_geofencing_enabled', $validatedGeofenceSettings)
            ? (bool) $validatedGeofenceSettings['attendance_geofencing_enabled']
            : (bool) $settings->attendance_geofencing_enabled;

        if ($geofencingEnabled && ! $location1Complete && ! $location2Complete) {
            throw ValidationException::withMessages([
                'attendance_geofencing_enabled' => 'Configure complete coordinates for at least one school site before enabling geofencing.',
            ]);
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
            'attendance_geofencing_enabled',
        ]);

        $data = $request->only($validColumns);
        unset($data['id'], $data['created_at'], $data['updated_at']);

        // Handle defaults based on Node backend
        $data['ca1_name'] = $request->input('ca1_name', 'CA 1');
        $data['ca2_name'] = $request->input('ca2_name', 'CA 2');
        $data['ca3_name'] = $request->input('ca3_name', 'CA 3');
        $data['ca4_name'] = $request->input('ca4_name', 'CA 4');
        $data['exam_name'] = $request->input('exam_name', 'Exam');
        $data['active_session'] = $request->input('active_session') ?: ($settings->active_session ?: $this->currentAcademicSession());
        $data['active_term'] = $request->input('active_term') ?: ($settings->active_term ?: '1st Term');

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
                $settings = $this->newSettingsWithAcademicDefaults();
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
                $settings = $this->newSettingsWithAcademicDefaults();
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

    private function newSettingsWithAcademicDefaults(): SystemSetting
    {
        $settings = new SystemSetting;
        $settings->active_session = $this->currentAcademicSession();
        $settings->active_term = '1st Term';

        return $settings;
    }

    private function currentAcademicSession(): string
    {
        return DB::table('academic_sessions')->where('is_current', 1)->value('session_name') ?: '2026/2027';
    }
}
