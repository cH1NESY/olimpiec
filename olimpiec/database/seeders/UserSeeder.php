<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Тестовый пользователь
        User::create([
            'name' => 'Иван Иванов',
            'email' => 'ivan@example.com',
            'password' => Hash::make('password'),
            'phone' => '+7 (999) 123-45-67',
            'address' => 'г. Москва, ул. Ленина, д. 10, кв. 5',
        ]);

        // Еще несколько пользователей
        User::create([
            'name' => 'Мария Петрова',
            'email' => 'maria@example.com',
            'password' => Hash::make('password'),
            'phone' => '+7 (999) 234-56-78',
            'address' => 'г. Москва, пр-т Мира, д. 25, кв. 12',
        ]);

        User::create([
            'name' => 'Алексей Сидоров',
            'email' => 'alex@example.com',
            'password' => Hash::make('password'),
            'phone' => '+7 (999) 345-67-89',
            'address' => 'г. Москва, ул. Пушкина, д. 5, кв. 3',
        ]);
    }
}
