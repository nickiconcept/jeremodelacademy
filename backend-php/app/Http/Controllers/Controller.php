<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

abstract class Controller
{
    protected function authenticatedUser(): mixed
    {
        return auth('api')->user();
    }

    protected function requireAdmin(): void
    {
        abort_unless($this->authenticatedUser()?->role === 'admin', 403, 'Administrator access required.');
    }

    protected function requireAdminOrSuperAdmin(): void
    {
        $user = $this->authenticatedUser();
        abort_unless(
            $user && $user->role === 'admin' && in_array('super_admin', $user->permissions ?? [], true),
            403,
            'Super administrator access required.'
        );
    }

    protected function teacherHasAssignment(int|string $classId, int|string|null $subjectId = null): bool
    {
        $user = $this->authenticatedUser();
        if (! $user || $user->role !== 'teacher') {
            return false;
        }

        $query = DB::table('class_subjects')
            ->where('class_id', $classId)
            ->where('teacher_id', $user->id);

        if ($subjectId !== null) {
            $query->where('subject_id', $subjectId);
        }

        return $query->exists();
    }

    protected function teacherIsFormMaster(int|string $classId): bool
    {
        $user = $this->authenticatedUser();

        return $user && $user->role === 'teacher' && DB::table('classes')
            ->where('id', $classId)
            ->where('form_master_id', $user->id)
            ->exists();
    }

    protected function teacherIsFormMasterForStudent(int|string $teacherId, int|string $studentId): bool
    {
        return DB::table('students')
            ->join('classes', 'students.class_id', '=', 'classes.id')
            ->where('students.id', $studentId)
            ->where('classes.form_master_id', $teacherId)
            ->exists();
    }

    protected function requireAdminOrAssignedTeacher(int|string $classId, int|string|null $subjectId = null): void
    {
        $user = $this->authenticatedUser();
        abort_unless(
            $user && ($user->role === 'admin' || $this->teacherHasAssignment($classId, $subjectId)),
            403,
            'You are not authorized to access this class or subject.'
        );
    }

    protected function requireAdminOrFormMaster(int|string $classId): void
    {
        $user = $this->authenticatedUser();
        abort_unless(
            $user && ($user->role === 'admin' || $this->teacherIsFormMaster($classId)),
            403,
            'You are not authorized to manage this class.'
        );
    }

    protected function requireAdminOrOwnStudent(int|string $studentId): void
    {
        $user = $this->authenticatedUser();
        abort_unless(
            $user && ($user->role === 'admin' || ($user->role === 'student' && (string) $user->id === (string) $studentId)),
            403,
            'You are not authorized to access this student.'
        );
    }
}
