<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'classes';
    protected $guarded = [];

    public function formMaster()
    {
        return $this->belongsTo(User::class, 'form_master_id');
    }
}
