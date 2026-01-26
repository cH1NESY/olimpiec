<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Create a new order
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size_id' => 'nullable|exists:sizes,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'delivery_method' => 'required|in:pickup,delivery',
            'delivery_address' => 'required_if:delivery_method,delivery|string|max:500',
            'store_id' => 'required_if:delivery_method,pickup|exists:stores,id',
            'comment' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $user = $request->user();
            
            // Calculate total and validate stock availability
            $total = 0;
            $itemsToCreate = [];
            
            foreach ($validated['items'] as $item) {
                // Lock product row to prevent race conditions
                $product = \App\Models\Product::lockForUpdate()->findOrFail($item['product_id']);
                
                // Validate stock availability
                if ($item['size_id']) {
                    $sizePivot = $product->sizes()->where('sizes.id', $item['size_id'])->first();
                    if (!$sizePivot || $sizePivot->pivot->stock_quantity < $item['quantity']) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => "Недостаточно товара '{$product->name}' размера {$sizePivot->name ?? 'N/A'} в наличии"
                        ], 400);
                    }
                } else {
                    if ($product->stock_quantity < $item['quantity']) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => "Недостаточно товара '{$product->name}' в наличии"
                        ], 400);
                    }
                }
                
                $itemPrice = $product->price;
                $itemTotal = $itemPrice * $item['quantity'];
                $total += $itemTotal;
                
                $itemsToCreate[] = [
                    'product_id' => $item['product_id'],
                    'size_id' => $item['size_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $itemPrice,
                    'total' => $itemTotal,
                ];
            }

            // Create order
            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'delivery_method' => $validated['delivery_method'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'store_id' => $validated['store_id'] ?? null,
                'status' => 'pending',
                'total_amount' => $total,
                'comment' => $validated['comment'] ?? null,
            ]);

            // Create order items
            foreach ($itemsToCreate as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'size_id' => $itemData['size_id'],
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                    'total' => $itemData['total'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Заказ создан успешно',
                'data' => $order->load('items.product')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при создании заказа: ' . $e->getMessage()
            ], 500);
        }
    }
}
