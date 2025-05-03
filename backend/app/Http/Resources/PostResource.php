<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'post_image' => $this->post_image,
            'title' => $this->title,
            'bio' => $this->bio,
            'likes' => $this->likes,
            'comments' => $this->comments,
            'user_id' => $this->user_id,
            'user_name' => $this->user_name ?: null
        ];
    }
}
