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
        // Главные категории
        $sport = Category::create([
            'name' => 'Спорт',
            'slug' => 'sport',
            'description' => 'Спортивные товары',
            'sort_order' => 1,
        ]);

        $football = Category::create([
            'name' => 'Футбол',
            'slug' => 'football',
            'description' => 'Футбольная экипировка',
            'parent_id' => $sport->id,
            'sort_order' => 1,
        ]);

        Category::create([
            'name' => 'Форма',
            'slug' => 'football-uniform',
            'description' => 'Футбольная форма',
            'parent_id' => $football->id,
            'sort_order' => 1,
        ]);

        Category::create([
            'name' => 'Бутсы',
            'slug' => 'football-boots',
            'description' => 'Футбольные бутсы',
            'parent_id' => $football->id,
            'sort_order' => 2,
        ]);

        Category::create([
            'name' => 'Мячи',
            'slug' => 'football-balls',
            'description' => 'Футбольные мячи',
            'parent_id' => $football->id,
            'sort_order' => 3,
        ]);

        $basketball = Category::create([
            'name' => 'Баскетбол',
            'slug' => 'basketball',
            'description' => 'Баскетбольная экипировка',
            'parent_id' => $sport->id,
            'sort_order' => 2,
        ]);

        Category::create([
            'name' => 'Форма',
            'slug' => 'basketball-uniform',
            'description' => 'Баскетбольная форма',
            'parent_id' => $basketball->id,
            'sort_order' => 1,
        ]);

        Category::create([
            'name' => 'Кроссовки',
            'slug' => 'basketball-shoes',
            'description' => 'Баскетбольные кроссовки',
            'parent_id' => $basketball->id,
            'sort_order' => 2,
        ]);

        $running = Category::create([
            'name' => 'Бег',
            'slug' => 'running',
            'description' => 'Товары для бега',
            'parent_id' => $sport->id,
            'sort_order' => 3,
        ]);

        Category::create([
            'name' => 'Кроссовки',
            'slug' => 'running-shoes',
            'description' => 'Беговые кроссовки',
            'parent_id' => $running->id,
            'sort_order' => 1,
        ]);

        $fitness = Category::create([
            'name' => 'Фитнес',
            'slug' => 'fitness',
            'description' => 'Товары для фитнеса',
            'parent_id' => $sport->id,
            'sort_order' => 4,
        ]);

        Category::create([
            'name' => 'Гантели',
            'slug' => 'dumbbells',
            'description' => 'Гантели и штанги',
            'parent_id' => $fitness->id,
            'sort_order' => 1,
        ]);
    }
}
