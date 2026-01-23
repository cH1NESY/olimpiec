<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Create payment in YooKassa
     */
    public function createPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::with('items.product')->findOrFail($validated['order_id']);

        // Check if order already has a payment
        if ($order->payment && $order->payment->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Заказ уже оплачен'
            ], 400);
        }

        // YooKassa credentials from .env
        $shopId = config('services.yookassa.shop_id');
        $secretKey = config('services.yookassa.secret_key');

        if (!$shopId || !$secretKey) {
            Log::error('YooKassa credentials not configured', [
                'shop_id_set' => !empty($shopId),
                'secret_key_set' => !empty($secretKey),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Настройки платежной системы не настроены. Обратитесь к администратору.'
            ], 500);
        }

        // Prepare payment data
        $amount = number_format($order->total_amount, 2, '.', '');
        $description = "Заказ #{$order->order_number}";
        
        $paymentData = [
            'amount' => [
                'value' => $amount,
                'currency' => 'RUB',
            ],
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/payment/success?order_id=' . $order->id,
            ],
            'capture' => true,
            'description' => $description,
            'metadata' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ];

        try {
            // Generate idempotence key (unique for each payment attempt)
            $idempotenceKey = uniqid('payment_', true);
            
            // Create payment in YooKassa
            $response = Http::withBasicAuth($shopId, $secretKey)
                ->withHeaders([
                    'Idempotence-Key' => $idempotenceKey,
                ])
                ->timeout(30)
                ->post('https://api.yookassa.ru/v3/payments', $paymentData);

            $statusCode = $response->status();
            $responseBody = $response->body();

            if (!$response->successful()) {
                Log::error('YooKassa payment creation failed', [
                    'order_id' => $order->id,
                    'status_code' => $statusCode,
                    'response' => $responseBody,
                    'request_data' => $paymentData,
                ]);

                $errorMessage = 'Ошибка при создании платежа';
                if ($statusCode === 401) {
                    $errorMessage = 'Неверные учетные данные ЮKassa';
                } elseif ($statusCode === 400) {
                    $errorMessage = 'Неверные данные платежа';
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
                    'debug' => config('app.debug') ? [
                        'status_code' => $statusCode,
                        'response' => $responseBody,
                    ] : null,
                ], 500);
            }

            $paymentResponse = $response->json();

            // Validate response structure
            if (!isset($paymentResponse['id']) || !isset($paymentResponse['confirmation']['confirmation_url'])) {
                Log::error('YooKassa invalid response structure', [
                    'order_id' => $order->id,
                    'response' => $paymentResponse,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Неверный формат ответа от ЮKassa'
                ], 500);
            }

            // Create or update payment record
            $payment = Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'method' => 'online',
                    'status' => 'pending',
                    'amount' => $order->total_amount,
                    'transaction_id' => $paymentResponse['id'],
                ]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_id' => $paymentResponse['id'],
                    'confirmation_url' => $paymentResponse['confirmation']['confirmation_url'],
                    'order_id' => $order->id,
                ]
            ]);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('YooKassa connection error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка подключения к ЮKassa. Проверьте настройки.'
            ], 500);
        } catch (\Exception $e) {
            Log::error('YooKassa payment exception', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при создании платежа: ' . $e->getMessage(),
                'debug' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null,
            ], 500);
        }
    }

    /**
     * Handle YooKassa webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        Log::info('YooKassa webhook received', [
            'request_data' => $request->all(),
        ]);

        $event = $request->input('event');
        $object = $request->input('object');

        Log::info('YooKassa webhook event', [
            'event' => $event,
            'object_id' => $object['id'] ?? null,
        ]);

        if ($event !== 'payment.succeeded') {
            Log::info('YooKassa webhook: event ignored', ['event' => $event]);
            return response()->json(['success' => true]);
        }

        $paymentId = $object['id'] ?? null;
        $metadata = $object['metadata'] ?? [];
        $orderId = $metadata['order_id'] ?? null;

        if (!$orderId) {
            Log::warning('YooKassa webhook: order_id not found', [
                'payment_id' => $paymentId,
                'metadata' => $metadata,
            ]);
            return response()->json(['success' => false, 'message' => 'Order ID not found'], 400);
        }

        DB::beginTransaction();
        try {
            $order = Order::findOrFail($orderId);
            
            // Find payment by transaction_id or create if not exists
            $payment = Payment::where('transaction_id', $paymentId)->first();
            
            if (!$payment) {
                // Try to find by order_id
                $payment = Payment::where('order_id', $orderId)->first();
                
                if (!$payment) {
                    // Create payment record if it doesn't exist
                    $payment = Payment::create([
                        'order_id' => $orderId,
                        'method' => 'online',
                        'status' => 'completed',
                        'amount' => $order->total_amount,
                        'transaction_id' => $paymentId,
                        'paid_at' => now(),
                    ]);
                } else {
                    // Update existing payment
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                        'transaction_id' => $paymentId,
                    ]);
                }
            } else {
                // Update existing payment
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                ]);
            }

            // Update order status
            $order->update([
                'status' => 'paid',
            ]);

            DB::commit();

            Log::info('YooKassa payment succeeded', [
                'order_id' => $orderId,
                'payment_id' => $paymentId,
                'order_number' => $order->order_number,
            ]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('YooKassa webhook error', [
                'order_id' => $orderId,
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Check payment status
     */
    public function checkStatus(Request $request, int $orderId): JsonResponse
    {
        $order = Order::with('payment')->findOrFail($orderId);

        // If order is not paid yet, try to check payment status from YooKassa
        if ($order->status !== 'paid' && $order->payment && $order->payment->transaction_id) {
            try {
                $shopId = config('services.yookassa.shop_id');
                $secretKey = config('services.yookassa.secret_key');

                if ($shopId && $secretKey) {
                    $response = Http::withBasicAuth($shopId, $secretKey)
                        ->timeout(10)
                        ->get("https://api.yookassa.ru/v3/payments/{$order->payment->transaction_id}");

                    if ($response->successful()) {
                        $paymentData = $response->json();
                        
                        if ($paymentData['status'] === 'succeeded') {
                            // Update payment and order status
                            DB::beginTransaction();
                            try {
                                $order->payment->update([
                                    'status' => 'completed',
                                    'paid_at' => now(),
                                ]);
                                
                                $order->update([
                                    'status' => 'paid',
                                ]);
                                
                                DB::commit();
                                
                                Log::info('Payment status updated from YooKassa API', [
                                    'order_id' => $orderId,
                                    'payment_id' => $order->payment->transaction_id,
                                ]);
                            } catch (\Exception $e) {
                                DB::rollBack();
                                Log::error('Error updating payment status', [
                                    'order_id' => $orderId,
                                    'error' => $e->getMessage(),
                                ]);
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error checking payment status from YooKassa', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Reload order to get updated status
        $order->refresh();

        return response()->json([
            'success' => true,
            'data' => [
                'order_status' => $order->status,
                'payment_status' => $order->payment ? $order->payment->status : null,
                'is_paid' => $order->status === 'paid',
            ]
        ]);
    }
}
