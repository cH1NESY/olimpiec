<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $stores = Store::all();
        $products = Product::where('is_active', true)->get();

        if ($users->isEmpty() || $products->isEmpty()) {
            $this->command->warn('Недостаточно данных для создания заказов. Сначала запустите UserSeeder и ProductSeeder.');
            return;
        }

        // Создаем несколько заказов для каждого пользователя
        foreach ($users as $user) {
            // 2-4 заказа на пользователя
            $orderCount = rand(2, 4);
            
            for ($i = 0; $i < $orderCount; $i++) {
                $deliveryMethod = rand(0, 1) ? 'pickup' : 'delivery';
                $store = $deliveryMethod === 'pickup' ? $stores->random() : null;
                
                $statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
                $status = $statuses[array_rand($statuses)];
                
                $order = Order::create([
                    'order_number' => 'ORD-' . strtoupper(uniqid()),
                    'user_id' => $user->id,
                    'customer_name' => $user->name,
                    'customer_email' => $user->email,
                    'customer_phone' => $user->phone ?? '+7 (999) 000-00-00',
                    'delivery_address' => $deliveryMethod === 'delivery' ? $user->address : null,
                    'delivery_method' => $deliveryMethod,
                    'store_id' => $store?->id,
                    'status' => $status,
                    'total_amount' => 0, // Будет пересчитано
                    'comment' => rand(0, 1) ? 'Пожалуйста, позвоните перед доставкой' : null,
                ]);

                // Добавляем товары в заказ
                $itemCount = rand(1, 4);
                $selectedProducts = $products->random(min($itemCount, $products->count()));
                $totalAmount = 0;

                foreach ($selectedProducts as $product) {
                    $quantity = rand(1, 3);
                    $price = $product->price;
                    $itemTotal = $price * $quantity;
                    $totalAmount += $itemTotal;

                    // Получаем случайный размер, если у товара есть размеры
                    $size = null;
                    if ($product->sizes()->count() > 0) {
                        $size = $product->sizes()->inRandomOrder()->first();
                    }

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'size_id' => $size?->id,
                        'quantity' => $quantity,
                        'price' => $price,
                        'total' => $itemTotal,
                    ]);
                }

                // Обновляем общую сумму заказа
                $order->update(['total_amount' => $totalAmount]);

                // Создаем оплату для оплаченных заказов
                if (in_array($status, ['paid', 'processing', 'shipped', 'delivered'])) {
                    $paymentStatus = $status === 'paid' ? 'completed' : ($status === 'processing' ? 'processing' : 'completed');
                    
                    Payment::create([
                        'order_id' => $order->id,
                        'method' => ['card', 'cash', 'online'][array_rand(['card', 'cash', 'online'])],
                        'status' => $paymentStatus,
                        'amount' => $totalAmount,
                        'transaction_id' => 'TXN-' . strtoupper(uniqid()),
                        'paid_at' => now()->subDays(rand(1, 30)),
                    ]);
                } else {
                    // Для pending заказов создаем pending оплату
                    Payment::create([
                        'order_id' => $order->id,
                        'method' => 'card',
                        'status' => 'pending',
                        'amount' => $totalAmount,
                    ]);
                }
            }
        }

        // Создаем несколько гостевых заказов (без пользователя)
        for ($i = 0; $i < 3; $i++) {
            $store = $stores->random();
            $status = ['pending', 'paid'][array_rand(['pending', 'paid'])];
            
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'user_id' => null,
                'customer_name' => 'Гость ' . ($i + 1),
                'customer_email' => 'guest' . ($i + 1) . '@example.com',
                'customer_phone' => '+7 (999) ' . rand(100, 999) . '-' . rand(10, 99) . '-' . rand(10, 99),
                'delivery_address' => 'г. Москва, ул. Примерная, д. ' . rand(1, 100),
                'delivery_method' => 'delivery',
                'store_id' => null,
                'status' => $status,
                'total_amount' => 0,
            ]);

            $itemCount = rand(1, 3);
            $selectedProducts = $products->random(min($itemCount, $products->count()));
            $totalAmount = 0;

            foreach ($selectedProducts as $product) {
                $quantity = rand(1, 2);
                $price = $product->price;
                $itemTotal = $price * $quantity;
                $totalAmount += $itemTotal;

                $size = null;
                if ($product->sizes()->count() > 0) {
                    $size = $product->sizes()->inRandomOrder()->first();
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'size_id' => $size?->id,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total' => $itemTotal,
                ]);
            }

            $order->update(['total_amount' => $totalAmount]);

            Payment::create([
                'order_id' => $order->id,
                'method' => $status === 'paid' ? 'online' : 'card',
                'status' => $status === 'paid' ? 'completed' : 'pending',
                'amount' => $totalAmount,
                'transaction_id' => $status === 'paid' ? 'TXN-' . strtoupper(uniqid()) : null,
                'paid_at' => $status === 'paid' ? now()->subDays(rand(1, 15)) : null,
            ]);
        }
    }
}
