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
        $stores = [
            [
                'name' => 'Олимпиец - Центральный',
                'address' => 'г. Москва, ул. Тверская, д. 10',
                'phone' => '+7 (495) 123-45-67',
                'email' => 'central@olimpiec.ru',
                'working_hours' => 'Пн-Вс: 10:00 - 22:00',
                'latitude' => 55.7558,
                'longitude' => 37.6173,
            ],
            [
                'name' => 'Олимпиец - Северный',
                'address' => 'г. Москва, Ленинградский пр-т, д. 50',
                'phone' => '+7 (495) 234-56-78',
                'email' => 'north@olimpiec.ru',
                'working_hours' => 'Пн-Вс: 10:00 - 22:00',
                'latitude' => 55.7934,
                'longitude' => 37.5500,
            ],
            [
                'name' => 'Олимпиец - Южный',
                'address' => 'г. Москва, ул. Варшавское шоссе, д. 100',
                'phone' => '+7 (495) 345-67-89',
                'email' => 'south@olimpiec.ru',
                'working_hours' => 'Пн-Вс: 10:00 - 22:00',
                'latitude' => 55.6226,
                'longitude' => 37.6064,
            ],
        ];

        foreach ($stores as $store) {
            Store::create($store);
        }
    }
}
