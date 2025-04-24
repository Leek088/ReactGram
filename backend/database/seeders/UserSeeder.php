<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Leonardo Nunes',
            'email' => 'leonardo@email.com',
            'password' => bcrypt('password'),
            'bio' => 'Só os fortes sobrevivem.',
            'abilities' => ['photo.index', 'photo.show', 'photo.store', 'photo.update', 'photo.destroy'],
        ]);

        User::factory()->count(10)->create();
    }
}
