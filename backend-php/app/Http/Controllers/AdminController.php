<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * Ensure only super_admin can access these routes.
     */
    public function __construct()
    {
        // We will enforce the middleware at the route level in api.php
    }

    /**
     * Get list of all admins
     */
    public function index(Request $request)
    {
        $user = auth('api')->user();
        
        // Strict Authorization Check
        if ($user->role !== 'admin' || !in_array('super_admin', $user->permissions ?? [])) {
            return response()->json(['error' => 'Access denied: Super Admin only.'], 403);
        }

        $admins = User::where('role', 'admin')->get();
        return response()->json($admins);
    }

    /**
     * Register a new Admin
     */
    public function register(Request $request)
    {
        $user = auth('api')->user();

        // Strict Authorization Check
        if ($user->role !== 'admin' || !in_array('super_admin', $user->permissions ?? [])) {
            return response()->json(['error' => 'Access denied: Super Admin only.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            DB::beginTransaction();

            // Generate Username (e.g., JMA/ADM/2026/001)
            $year = date('Y');
            $latestAdmin = User::where('role', 'admin')
                ->where('username', 'like', "JMA/ADM/{$year}/%")
                ->orderBy('username', 'desc')
                ->first();

            $sequence = 1;
            if ($latestAdmin) {
                $parts = explode('/', $latestAdmin->username);
                $sequence = (int)end($parts) + 1;
            }
            $username = sprintf("JMA/ADM/%s/%03d", $year, $sequence);

            $permissions = $request->input('permissions', []);
            // Prevent someone from creating another super_admin unless we explicitly want them to.
            // Let's allow it if the current user is a super_admin, they can create another one.

            $newAdmin = new User();
            $newAdmin->full_name = $request->input('full_name');
            $newAdmin->email = $request->input('email');
            $newAdmin->username = $username;
            $newAdmin->password_hash = Hash::make($request->input('password'));
            $newAdmin->role = 'admin';
            $newAdmin->permissions = $permissions;
            $newAdmin->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Admin registered successfully.',
                'admin' => $newAdmin
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Elevate an existing user (e.g., teacher) to Admin
     */
    public function elevate(Request $request)
    {
        $user = auth('api')->user();

        // Strict Authorization Check
        if ($user->role !== 'admin' || !in_array('super_admin', $user->permissions ?? [])) {
            return response()->json(['error' => 'Access denied: Super Admin only.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $targetUser = User::where('username', $request->username)->first();
        if (!$targetUser) {
            return response()->json(['error' => 'User not found with that Staff ID/Username.'], 404);
        }

        if ($targetUser->role === 'admin') {
            return response()->json(['error' => 'User is already an administrator.'], 400);
        }

        $targetUser->role = 'admin';
        $targetUser->permissions = $request->permissions ?? [];
        $targetUser->save();

        return response()->json([
            'message' => "User {$targetUser->username} successfully elevated to Administrator.",
            'admin' => $targetUser
        ], 200);
    }

    /**
     * Update an existing Admin (Permissions, Details, Password)
     */
    public function update(Request $request, $id)
    {
        $user = auth('api')->user();

        // Strict Authorization Check
        if ($user->role !== 'admin' || !in_array('super_admin', $user->permissions ?? [])) {
            return response()->json(['error' => 'Access denied: Super Admin only.'], 403);
        }

        $admin = User::where('role', 'admin')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($admin->id),
            ],
            'password' => 'nullable|string|min:6',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        if ($request->has('full_name')) $admin->full_name = $request->input('full_name');
        if ($request->has('email')) $admin->email = $request->input('email');
        if ($request->has('permissions')) $admin->permissions = $request->input('permissions');
        if ($request->filled('password')) {
            $admin->password_hash = Hash::make($request->input('password'));
        }

        $admin->save();

        return response()->json([
            'success' => true,
            'message' => 'Admin updated successfully.',
            'admin' => $admin
        ]);
    }
    
    /**
     * Delete an Admin
     */
    public function destroy($id)
    {
        $user = auth('api')->user();

        // Strict Authorization Check
        if ($user->role !== 'admin' || !in_array('super_admin', $user->permissions ?? [])) {
            return response()->json(['error' => 'Access denied: Super Admin only.'], 403);
        }
        
        // Prevent deleting oneself
        if ($user->id == $id) {
            return response()->json(['error' => 'You cannot delete your own account.'], 400);
        }

        $admin = User::where('role', 'admin')->findOrFail($id);
        $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin deleted successfully.'
        ]);
    }
}
