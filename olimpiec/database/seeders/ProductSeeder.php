<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductCharacteristic;
use App\Models\ProductImage;
use App\Models\Size;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $nike = Brand::where('slug', 'nike')->first();
        $adidas = Brand::where('slug', 'adidas')->first();
        $puma = Brand::where('slug', 'puma')->first();
        $reebok = Brand::where('slug', 'reebok')->first();
        
        $footballUniform = Category::where('slug', 'football-uniform')->first();
        $footballBalls = Category::where('slug', 'football-balls')->first();
        $footballBoots = Category::where('slug', 'football-boots')->first();
        $basketballUniform = Category::where('slug', 'basketball-uniform')->first();
        $basketballShoes = Category::where('slug', 'basketball-shoes')->first();
        $runningShoes = Category::where('slug', 'running-shoes')->first();
        $dumbbells = Category::where('slug', 'dumbbells')->first();

        $sizes = Size::where('type', 'clothing')->get();
        $shoeSizes = Size::where('type', 'shoes')->get();

        // Футбольные мячи
        $this->createFootballBall('Футбольный мяч Nike Strike', 'football-ball-nike-strike', $nike, $footballBalls, 2500, 3000, false);
        $this->createFootballBall('Футбольный мяч Adidas Tiro', 'football-ball-adidas-tiro', $adidas, $footballBalls, 2200, null, true);
        $this->createFootballBall('Футбольный мяч Puma Future', 'football-ball-puma-future', $puma, $footballBalls, 2000, null, false);

        // Футбольная форма
        $this->createFootballUniform('Футбольная форма Adidas', 'football-uniform-adidas', $adidas, $footballUniform, 3500, null, true, $sizes);
        $this->createFootballUniform('Футбольная форма Nike', 'football-uniform-nike', $nike, $footballUniform, 4200, 5000, false, $sizes);
        $this->createFootballUniform('Футбольная форма Puma', 'football-uniform-puma', $puma, $footballUniform, 3200, null, false, $sizes);

        // Футбольные бутсы
        $this->createFootballBoots('Бутсы Nike Mercurial', 'football-boots-nike-mercurial', $nike, $footballBoots, 8500, 10000, true, $shoeSizes);
        $this->createFootballBoots('Бутсы Adidas Predator', 'football-boots-adidas-predator', $adidas, $footballBoots, 9000, null, false, $shoeSizes);
        $this->createFootballBoots('Бутсы Puma Future', 'football-boots-puma-future', $puma, $footballBoots, 7500, null, false, $shoeSizes);

        // Баскетбольная форма
        $this->createBasketballUniform('Баскетбольная форма Nike', 'basketball-uniform-nike', $nike, $basketballUniform, 4500, null, true, $sizes);
        $this->createBasketballUniform('Баскетбольная форма Adidas', 'basketball-uniform-adidas', $adidas, $basketballUniform, 4000, null, false, $sizes);

        // Баскетбольные кроссовки
        $this->createBasketballShoes('Кроссовки Nike Air Jordan', 'basketball-shoes-nike-jordan', $nike, $basketballShoes, 12000, 15000, true, $shoeSizes);
        $this->createBasketballShoes('Кроссовки Adidas Harden', 'basketball-shoes-adidas-harden', $adidas, $basketballShoes, 11000, null, false, $shoeSizes);

        // Беговые кроссовки
        $this->createRunningShoes('Беговые кроссовки Nike Air Max', 'running-shoes-nike-air-max', $nike, $runningShoes, 8500, 10000, true, $shoeSizes);
        $this->createRunningShoes('Беговые кроссовки Adidas Ultraboost', 'running-shoes-adidas-ultraboost', $adidas, $runningShoes, 9500, null, false, $shoeSizes);
        $this->createRunningShoes('Беговые кроссовки Puma Speedcat', 'running-shoes-puma-speedcat', $puma, $runningShoes, 7000, null, false, $shoeSizes);

        // Гантели
        $this->createDumbbells('Гантели 5кг (пара)', 'dumbbells-5kg', $dumbbells, 1800, null, false);
        $this->createDumbbells('Гантели 10кг (пара)', 'dumbbells-10kg', $dumbbells, 3200, null, false);
        $this->createDumbbells('Гантели 15кг (пара)', 'dumbbells-15kg', $dumbbells, 4500, null, true);
    }

    private function createFootballBall($name, $slug, $brand, $category, $price, $oldPrice, $isNew)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Профессиональный футбольный мяч для игры на любом покрытии',
            'full_description' => 'Футбольный мяч изготовлен из высококачественных материалов. Идеально подходит для тренировок и игр на любом покрытии. Отличное сцепление и контроль.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(20, 100),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(35, 50) / 10, 2),
            'reviews_count' => rand(5, 50),
            'sales_count' => rand(10, 200),
        ]);

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Синтетическая кожа', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Размер', 'value' => '5', 'sort_order' => 2]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Вес', 'value' => '410-450 г', 'sort_order' => 3]);
    }

    private function createFootballUniform($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Комплект футбольной формы для тренировок и игр',
            'full_description' => 'Современная футбольная форма из дышащих материалов. В комплект входит футболка и шорты. Отличная вентиляция и комфорт.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'male',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(15, 50),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(40, 50) / 10, 2),
            'reviews_count' => rand(10, 80),
            'sales_count' => rand(20, 150),
        ]);

        foreach ($sizes->take(5) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(2, 10)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Состав', 'value' => 'Футболка + Шорты', 'sort_order' => 2]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Уход', 'value' => 'Машинная стирка', 'sort_order' => 3]);
    }

    private function createFootballBoots($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $shoeSizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Профессиональные футбольные бутсы',
            'full_description' => 'Футбольные бутсы обеспечивают отличное сцепление с поверхностью и контроль мяча. Легкие и удобные.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(10, 40),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(42, 50) / 10, 2),
            'reviews_count' => rand(15, 100),
            'sales_count' => rand(30, 200),
        ]);

        foreach ($shoeSizes->whereIn('name', ['40', '41', '42', '43', '44', '45']) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(2, 8)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал верха', 'value' => 'Синтетическая кожа', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Подошва', 'value' => 'Резина', 'sort_order' => 2]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Шипы', 'value' => 'Сменные', 'sort_order' => 3]);
    }

    private function createBasketballUniform($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Баскетбольная форма для игры',
            'full_description' => 'Современная баскетбольная форма из качественных материалов. Комфорт и свобода движений.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(15, 45),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(38, 48) / 10, 2),
            'reviews_count' => rand(8, 60),
            'sales_count' => rand(15, 120),
        ]);

        foreach ($sizes->take(6) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(2, 8)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Состав', 'value' => 'Футболка + Шорты', 'sort_order' => 2]);
    }

    private function createBasketballShoes($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $shoeSizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Профессиональные баскетбольные кроссовки',
            'full_description' => 'Баскетбольные кроссовки с отличной амортизацией и поддержкой. Идеальны для игры на паркете.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(8, 35),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(40, 50) / 10, 2),
            'reviews_count' => rand(20, 150),
            'sales_count' => rand(50, 300),
        ]);

        foreach ($shoeSizes->whereIn('name', ['40', '41', '42', '43', '44', '45', '46']) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(1, 6)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал верха', 'value' => 'Кожа + Сетка', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Подошва', 'value' => 'Резина', 'sort_order' => 2]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Амортизация', 'value' => 'Air/Boost', 'sort_order' => 3]);
    }

    private function createRunningShoes($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $shoeSizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Удобные беговые кроссовки',
            'full_description' => 'Беговые кроссовки обеспечивают максимальный комфорт и поддержку во время бега. Отличная амортизация и вентиляция.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(12, 50),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(40, 50) / 10, 2),
            'reviews_count' => rand(25, 200),
            'sales_count' => rand(40, 250),
        ]);

        foreach ($shoeSizes->whereIn('name', ['38', '39', '40', '41', '42', '43', '44', '45']) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(2, 7)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал верха', 'value' => 'Синтетическая кожа + Сетка', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Подошва', 'value' => 'Резина', 'sort_order' => 2]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Вес', 'value' => '280-320 г', 'sort_order' => 3]);
    }

    private function createDumbbells($name, $slug, $category, $price, $oldPrice, $isNew)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Набор гантелей для домашних тренировок',
            'full_description' => 'Прочные чугунные гантели с неопреновым покрытием. Идеально подходят для силовых тренировок дома или в зале.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(20, 80),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(35, 48) / 10, 2),
            'reviews_count' => rand(5, 80),
            'sales_count' => rand(15, 150),
        ]);

        $weight = str_replace(['Гантели ', ' (пара)'], '', $name);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Вес', 'value' => $weight . ' (каждая)', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Чугун + Неопрен', 'sort_order' => 2]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Покрытие', 'value' => 'Неопрен', 'sort_order' => 3]);
    }
}
