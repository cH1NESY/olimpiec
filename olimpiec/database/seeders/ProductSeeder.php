<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductCharacteristic;
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
        
        // Новые категории
        $futbolki = Category::where('slug', 'futbolki')->first();
        $sportivnyeKostyumy = Category::where('slug', 'sportivnye-kostyumy')->first();
        $komplekty = Category::where('slug', 'komplekty')->first();
        $kurtki = Category::where('slug', 'kurtki')->first();
        $kurtkiZima = Category::where('slug', 'kurtki-zima')->first();
        $sportivnyeBryuki = Category::where('slug', 'sportivnye-bryuki')->first();
        $shorty = Category::where('slug', 'shorty')->first();
        $borcovki = Category::where('slug', 'borcovki')->first();
        $koftyVetrovki = Category::where('slug', 'kofty-vetrovki')->first();
        $zhilety = Category::where('slug', 'zhilety')->first();
        $shapki = Category::where('slug', 'shapki')->first();
        $sumkiRyukzaki = Category::where('slug', 'sumki-ryukzaki')->first();

        $sizes = Size::where('type', 'clothing')->get();
        $shoeSizes = Size::where('type', 'shoes')->get();

        // Футболки
        $this->createTShirt('Футболка Nike Dri-FIT', 'futbolka-nike-dri-fit', $nike, $futbolki, 1500, null, true, $sizes);
        $this->createTShirt('Футболка Adidas Climalite', 'futbolka-adidas-climalite', $adidas, $futbolki, 1400, null, false, $sizes);
        $this->createTShirt('Футболка Puma Dry Cell', 'futbolka-puma-dry-cell', $puma, $futbolki, 1300, null, false, $sizes);

        // Спортивные костюмы
        $this->createSuit('Спортивный костюм Nike', 'sportivnyj-kostyum-nike', $nike, $sportivnyeKostyumy, 5500, 6500, true, $sizes);
        $this->createSuit('Спортивный костюм Adidas', 'sportivnyj-kostyum-adidas', $adidas, $sportivnyeKostyumy, 5200, null, false, $sizes);
        $this->createSuit('Спортивный костюм Puma', 'sportivnyj-kostyum-puma', $puma, $sportivnyeKostyumy, 4800, null, false, $sizes);

        // Комплекты
        $this->createSet('Комплект спортивный Nike', 'komplekt-sportivnyj-nike', $nike, $komplekty, 4500, null, true, $sizes);
        $this->createSet('Комплект спортивный Adidas', 'komplekt-sportivnyj-adidas', $adidas, $komplekty, 4200, null, false, $sizes);

        // Куртки
        $this->createJacket('Куртка спортивная Nike', 'kurtka-sportivnaya-nike', $nike, $kurtki, 6500, null, true, $sizes);
        $this->createJacket('Куртка спортивная Adidas', 'kurtka-sportivnaya-adidas', $adidas, $kurtki, 6200, null, false, $sizes);
        $this->createJacket('Куртка спортивная Puma', 'kurtka-sportivnaya-puma', $puma, $kurtki, 5800, null, false, $sizes);

        // Зимние куртки
        $this->createWinterJacket('Зимняя куртка Nike', 'zimnyaya-kurtka-nike', $nike, $kurtkiZima, 8500, 10000, true, $sizes);
        $this->createWinterJacket('Зимняя куртка Adidas', 'zimnyaya-kurtka-adidas', $adidas, $kurtkiZima, 8200, null, false, $sizes);

        // Спортивные брюки
        $this->createPants('Спортивные брюки Nike', 'sportivnye-bryuki-nike', $nike, $sportivnyeBryuki, 3500, null, true, $sizes);
        $this->createPants('Спортивные брюки Adidas', 'sportivnye-bryuki-adidas', $adidas, $sportivnyeBryuki, 3200, null, false, $sizes);
        $this->createPants('Спортивные брюки Puma', 'sportivnye-bryuki-puma', $puma, $sportivnyeBryuki, 3000, null, false, $sizes);

        // Шорты
        $this->createShorts('Шорты спортивные Nike', 'shorty-sportivnye-nike', $nike, $shorty, 2500, null, true, $sizes);
        $this->createShorts('Шорты спортивные Adidas', 'shorty-sportivnye-adidas', $adidas, $shorty, 2300, null, false, $sizes);

        // Борцовки
        $this->createWrestlingShoes('Борцовки Nike', 'borcovki-nike', $nike, $borcovki, 4500, null, true, $shoeSizes);
        $this->createWrestlingShoes('Борцовки Adidas', 'borcovki-adidas', $adidas, $borcovki, 4200, null, false, $shoeSizes);

        // Кофты и ветровки
        $this->createSweater('Ветровка Nike', 'vetrovka-nike', $nike, $koftyVetrovki, 4000, null, true, $sizes);
        $this->createSweater('Кофта Adidas', 'kofta-adidas', $adidas, $koftyVetrovki, 3800, null, false, $sizes);

        // Жилеты
        $this->createVest('Жилет спортивный Nike', 'zhilet-sportivnyj-nike', $nike, $zhilety, 2800, null, false, $sizes);
        $this->createVest('Жилет спортивный Adidas', 'zhilet-sportivnyj-adidas', $adidas, $zhilety, 2600, null, true, $sizes);

        // Шапки
        $this->createHat('Шапка спортивная Nike', 'shapka-sportivnaya-nike', $nike, $shapki, 1200, null, false);
        $this->createHat('Шапка спортивная Adidas', 'shapka-sportivnaya-adidas', $adidas, $shapki, 1100, null, true);

        // Сумки и рюкзаки
        $this->createBag('Рюкзак спортивный Nike', 'ryukzak-sportivnyj-nike', $nike, $sumkiRyukzaki, 3500, null, true);
        $this->createBag('Сумка спортивная Adidas', 'sumka-sportivnaya-adidas', $adidas, $sumkiRyukzaki, 2800, null, false);
    }

    private function createTShirt($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Спортивная футболка из дышащих материалов',
            'full_description' => 'Футболка обеспечивает отличную вентиляцию и комфорт во время тренировок. Быстро сохнет и не впитывает влагу.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(20, 80),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(40, 50) / 10, 2),
            'reviews_count' => rand(15, 100),
            'sales_count' => rand(30, 200),
        ]);

        foreach ($sizes->take(6) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(3, 12)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Технология', 'value' => 'Dri-FIT/Climalite', 'sort_order' => 2]);
    }

    private function createSuit($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Спортивный костюм для тренировок',
            'full_description' => 'Спортивный костюм из качественных материалов. В комплект входит куртка и брюки. Идеален для занятий спортом.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(15, 50),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(42, 50) / 10, 2),
            'reviews_count' => rand(20, 120),
            'sales_count' => rand(40, 180),
        ]);

        foreach ($sizes->take(6) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(2, 8)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Состав', 'value' => 'Куртка + Брюки', 'sort_order' => 2]);
    }

    private function createSet($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Спортивный комплект',
            'full_description' => 'Комплект спортивной одежды для тренировок и активного отдыха.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(12, 45),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(38, 48) / 10, 2),
            'reviews_count' => rand(10, 80),
            'sales_count' => rand(25, 150),
        ]);

        foreach ($sizes->take(5) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(2, 6)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
    }

    private function createJacket($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Спортивная куртка',
            'full_description' => 'Спортивная куртка из качественных материалов. Защищает от ветра и дождя.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(10, 40),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(40, 50) / 10, 2),
            'reviews_count' => rand(15, 100),
            'sales_count' => rand(30, 200),
        ]);

        foreach ($sizes->take(6) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(2, 7)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Защита', 'value' => 'Ветронепроницаемая', 'sort_order' => 2]);
    }

    private function createWinterJacket($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Зимняя спортивная куртка',
            'full_description' => 'Теплая зимняя куртка для занятий спортом в холодное время года. Отличная теплоизоляция.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(8, 35),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(42, 50) / 10, 2),
            'reviews_count' => rand(20, 120),
            'sales_count' => rand(40, 180),
        ]);

        foreach ($sizes->take(6) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(1, 6)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер + Утеплитель', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Температура', 'value' => 'До -25°C', 'sort_order' => 2]);
    }

    private function createPants($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Спортивные брюки',
            'full_description' => 'Удобные спортивные брюки для тренировок. Эластичный материал обеспечивает свободу движений.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(15, 50),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(40, 50) / 10, 2),
            'reviews_count' => rand(15, 100),
            'sales_count' => rand(30, 200),
        ]);

        foreach ($sizes->take(6) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(2, 8)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер + Эластан', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Пояс', 'value' => 'Эластичный', 'sort_order' => 2]);
    }

    private function createShorts($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Спортивные шорты',
            'full_description' => 'Легкие спортивные шорты для тренировок. Отличная вентиляция и комфорт.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(20, 60),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(38, 48) / 10, 2),
            'reviews_count' => rand(10, 80),
            'sales_count' => rand(25, 150),
        ]);

        foreach ($sizes->take(5) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(3, 10)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
    }

    private function createWrestlingShoes($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $shoeSizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Борцовки для борьбы',
            'full_description' => 'Профессиональные борцовки для занятий борьбой. Обеспечивают отличное сцепление с ковром.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(8, 30),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(42, 50) / 10, 2),
            'reviews_count' => rand(15, 100),
            'sales_count' => rand(30, 200),
        ]);

        foreach ($shoeSizes->whereIn('name', ['38', '39', '40', '41', '42', '43', '44', '45']) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(1, 5)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал верха', 'value' => 'Кожа', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Подошва', 'value' => 'Резина', 'sort_order' => 2]);
    }

    private function createSweater($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Ветровка или кофта',
            'full_description' => 'Спортивная ветровка или кофта для тренировок и активного отдыха.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(12, 45),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(38, 48) / 10, 2),
            'reviews_count' => rand(10, 80),
            'sales_count' => rand(25, 150),
        ]);

        foreach ($sizes->take(6) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(2, 7)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
    }

    private function createVest($name, $slug, $brand, $category, $price, $oldPrice, $isNew, $sizes)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Спортивный жилет',
            'full_description' => 'Спортивный жилет для тренировок. Легкий и удобный.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(15, 50),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(35, 45) / 10, 2),
            'reviews_count' => rand(5, 60),
            'sales_count' => rand(15, 120),
        ]);

        foreach ($sizes->take(5) as $size) {
            $product->sizes()->attach($size->id, ['stock_quantity' => rand(3, 8)]);
        }

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
    }

    private function createHat($name, $slug, $brand, $category, $price, $oldPrice, $isNew)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Спортивная шапка',
            'full_description' => 'Теплая спортивная шапка для тренировок в холодное время года.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(25, 80),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(38, 48) / 10, 2),
            'reviews_count' => rand(8, 70),
            'sales_count' => rand(20, 140),
        ]);

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Акрил + Шерсть', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Размер', 'value' => 'Универсальный', 'sort_order' => 2]);
    }

    private function createBag($name, $slug, $brand, $category, $price, $oldPrice, $isNew)
    {
        $product = Product::create([
            'name' => $name,
            'slug' => $slug,
            'description' => 'Спортивная сумка или рюкзак',
            'full_description' => 'Удобная спортивная сумка или рюкзак для переноски спортивной экипировки.',
            'price' => $price,
            'old_price' => $oldPrice,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'gender' => 'unisex',
            'is_new' => $isNew,
            'is_active' => true,
            'stock_quantity' => rand(10, 40),
            'sku' => strtoupper(substr($slug, 0, 8)) . '-' . rand(100, 999),
            'rating' => round(rand(40, 50) / 10, 2),
            'reviews_count' => rand(12, 90),
            'sales_count' => rand(30, 160),
        ]);

        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Материал', 'value' => 'Полиэстер', 'sort_order' => 1]);
        ProductCharacteristic::create(['product_id' => $product->id, 'name' => 'Объем', 'value' => '30-40 литров', 'sort_order' => 2]);
    }
}
