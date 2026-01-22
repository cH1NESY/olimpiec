<?php

namespace Database\Seeders;

use App\Models\Store;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Store::create([
            'name' => 'Олимпиец',
            'address' => 'г. Улан-Удэ, ул. Бабушкина, д. 37а',
            'phone' => '89146397408, 89835397989',
            'email' => 'info@olimpiec.ru',
            'working_hours' => 'Пн-Вс: 10:00 - 22:00',
            'latitude' => 51.8272,
            'longitude' => 107.6063,
        ]);
    }
}
