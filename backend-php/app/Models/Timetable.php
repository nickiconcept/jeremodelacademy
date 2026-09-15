<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timetable extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function class() { return $this->belongsTo(SchoolClass::class, 'class_id'); }
    public function subject() { return $this->belongsTo(Subject::class, 'subject_id'); }
    public function teacher() { return $this->belongsTo(User::class, 'teacher_id'); }
}
