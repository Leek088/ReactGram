<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    protected function casts(): array
    {
        return [
            'likes' => 'array',
            'comments' => 'array',
        ];
    }
}
