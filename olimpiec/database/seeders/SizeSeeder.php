<?php

namespace Database\Seeders;

use App\Models\Size;
use Illuminate\Database\Seeder;

class SizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Размеры одежды
        $clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        foreach ($clothingSizes as $size) {
            Size::create([
                'name' => $size,
                'type' => 'clothing',
            ]);
        }

        // Размеры обуви
        $shoeSizes = [];
        for ($i = 35; $i <= 46; $i++) {
            $shoeSizes[] = (string)$i;
        }
        foreach ($shoeSizes as $size) {
            Size::create([
                'name' => $size,
                'type' => 'shoes',
            ]);
        }
    }
}
