<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Жилеты', 'slug' => 'zhilety', 'description' => 'Спортивные жилеты', 'sort_order' => 1],
            ['name' => 'Куртки', 'slug' => 'kurtki', 'description' => 'Спортивные куртки', 'sort_order' => 2],
            ['name' => 'Спортивные брюки', 'slug' => 'sportivnye-bryuki', 'description' => 'Спортивные брюки', 'sort_order' => 3],
            ['name' => 'Куртки зима', 'slug' => 'kurtki-zima', 'description' => 'Зимние спортивные куртки', 'sort_order' => 4],
            ['name' => 'Шапки', 'slug' => 'shapki', 'description' => 'Спортивные шапки', 'sort_order' => 5],
            ['name' => 'Шорты', 'slug' => 'shorty', 'description' => 'Спортивные шорты', 'sort_order' => 6],
            ['name' => 'Трико борцовское', 'slug' => 'triko-borcovskoe', 'description' => 'Борцовское трико', 'sort_order' => 7],
            ['name' => 'Сумки, рюкзаки', 'slug' => 'sumki-ryukzaki', 'description' => 'Спортивные сумки и рюкзаки', 'sort_order' => 8],
            ['name' => 'Комплекты', 'slug' => 'komplekty', 'description' => 'Спортивные комплекты', 'sort_order' => 9],
            ['name' => 'Борцовки', 'slug' => 'borcovki', 'description' => 'Борцовки', 'sort_order' => 10],
            ['name' => 'Кофты, ветровки', 'slug' => 'kofty-vetrovki', 'description' => 'Кофты и ветровки', 'sort_order' => 11],
            ['name' => 'Спортивные костюмы', 'slug' => 'sportivnye-kostyumy', 'description' => 'Спортивные костюмы', 'sort_order' => 12],
            ['name' => 'Футболки', 'slug' => 'futbolki', 'description' => 'Спортивные футболки', 'sort_order' => 13],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
