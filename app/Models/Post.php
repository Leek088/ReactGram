<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PhotoFactory> */
    use HasFactory;

    protected $fillable = [
        'post_image',
        'title',
        'likes',
        'comments',
        'bio',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'likes' => 'array',
            'comments' => 'array',
        ];
    }
}
