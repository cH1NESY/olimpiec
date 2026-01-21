<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            ['name' => 'Nike', 'slug' => 'nike', 'description' => 'Just Do It'],
            ['name' => 'Adidas', 'slug' => 'adidas', 'description' => 'Impossible is Nothing'],
            ['name' => 'Puma', 'slug' => 'puma', 'description' => 'Forever Faster'],
            ['name' => 'Reebok', 'slug' => 'reebok', 'description' => 'I Am What I Am'],
            ['name' => 'Under Armour', 'slug' => 'under-armour', 'description' => 'I Will'],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}
