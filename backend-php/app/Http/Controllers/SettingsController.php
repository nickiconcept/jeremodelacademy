<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SystemSetting;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::latest('id')->first();
        if ($settings) {
            $settings->school_logo_url = $settings->school_logo_path ? url('storage/' . $settings->school_logo_path) : null;
        }
        return response()->json($settings);
    }

    public function store(Request $request)
    {
        $settings = SystemSetting::latest('id')->first();
        if (!$settings) {
            $settings = new SystemSetting();
        }
        
        $validColumns = \Illuminate\Support\Facades\Schema::getColumnListing($settings->getTable());
        // Force add recently added columns to bypass any schema caching issues
        $validColumns = array_merge($validColumns, [
            'attendance_location1_name',
            'attendance_location2_name',
            'attendance_location1_lat',
            'attendance_location1_lng',
            'attendance_location2_lat',
            'attendance_location2_lng',
            'attendance_radius',
            'landing_school_name'
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

        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,jpg,png|max:250',
        ], [
            'logo.max' => 'The school logo must not be greater than 250 kilobytes.',
            'logo.mimes' => 'The school logo must be a file of type: jpeg, jpg, png.',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            
            $settings = SystemSetting::latest('id')->first();
            if (!$settings) {
                $settings = new SystemSetting();
            }
            $settings->school_logo_path = $path;
            $settings->save();

            return response()->json([
                'message' => 'Logo uploaded successfully',
                'school_logo_url' => url('storage/' . $path)
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }
}
