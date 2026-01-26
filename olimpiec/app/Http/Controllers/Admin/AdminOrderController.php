<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminOrderController extends Controller
{
    /**
     * Display a listing of orders with filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['user', 'store', 'items.product', 'items.size']);

            // Filter by status
            $status = $request->get('status');
            if ($status && trim($status) !== '') {
                $query->where('status', $status);
            }

            // Filter by date range
            $dateFrom = $request->get('date_from');
            if ($dateFrom && trim($dateFrom) !== '') {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            $dateTo = $request->get('date_to');
            if ($dateTo && trim($dateTo) !== '') {
                $query->whereDate('created_at', '<=', $dateTo);
            }

            // Search by order number or customer name/email
            // Using parameterized queries to prevent SQL injection
            $search = $request->get('search');
            if ($search && trim($search) !== '') {
                $searchTerm = '%' . mb_strtolower(trim($search)) . '%';
                $query->where(function($q) use ($searchTerm) {
                    $q->whereRaw('LOWER(order_number) LIKE ?', [$searchTerm])
                      ->orWhereRaw('LOWER(customer_name) LIKE ?', [$searchTerm])
                      ->orWhereRaw('LOWER(customer_email) LIKE ?', [$searchTerm]);
                });
            }

            $perPage = $request->get('per_page', 20);
            $orders = $query->orderBy('id', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $orders->items(),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminOrderController@index error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке заказов: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order
     */
    public function show(string $id): JsonResponse
    {
        $order = Order::with(['user', 'store', 'items.product.images', 'items.size', 'payment'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,paid,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Статус заказа обновлен',
            'data' => $order->load(['user', 'store', 'items.product', 'items.size'])
        ]);
    }
}
