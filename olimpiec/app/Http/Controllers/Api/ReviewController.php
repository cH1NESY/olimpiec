<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Get reviews for a product
     */
    public function index(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        
        // Get all approved reviews
        $query = Review::where('product_id', $productId)
            ->where(function($q) {
                $q->where('is_approved', true);
                
                // If user is authenticated, also show their pending reviews
                if (Auth::check()) {
                    $userId = Auth::id();
                    $q->orWhere(function($subQ) use ($userId) {
                        $subQ->where('user_id', $userId)
                             ->where('is_approved', false);
                    });
                }
            });
        
        $reviews = $query->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews->values()->all(),
            'meta' => [
                'total' => $reviews->count(),
            ]
        ]);
    }

    /**
     * Check if user can review this product
     */
    public function canReview(Request $request, int $productId): JsonResponse
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return response()->json([
                'success' => true,
                'can_review' => false,
                'message' => 'Необходима авторизация'
            ]);
        }
        
        $hasOrderedProduct = \App\Models\OrderItem::whereHas('order', function($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->whereIn('status', ['paid', 'processing', 'shipped', 'delivered']);
        })
        ->where('product_id', $productId)
        ->exists();
        
        return response()->json([
            'success' => true,
            'can_review' => $hasOrderedProduct,
            'message' => $hasOrderedProduct 
                ? 'Вы можете оставить отзыв' 
                : 'Вы можете оставить отзыв только на товары, которые вы заказали'
        ]);
    }

    /**
     * Create a new review
     */
    public function store(Request $request, int $productId): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'user_name' => 'required|string|max:255',
            'user_email' => 'nullable|email|max:255',
        ]);

        $product = Product::findOrFail($productId);

        // Check if user is authenticated
        $userId = Auth::id();
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Необходима авторизация для оставления отзыва'
            ], 401);
        }
        
        // Check if user has ordered this product - REQUIRED for review
        $hasOrderedProduct = \App\Models\OrderItem::whereHas('order', function($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->whereIn('status', ['paid', 'processing', 'shipped', 'delivered']);
        })
        ->where('product_id', $productId)
        ->exists();
        
        if (!$hasOrderedProduct) {
            return response()->json([
                'success' => false,
                'message' => 'Вы можете оставить отзыв только на товары, которые вы заказали'
            ], 403);
        }
        
        // Create review - auto-approve for authenticated users who ordered the product
        $review = Review::create([
            'product_id' => $productId,
            'user_id' => $userId,
            'user_name' => $validated['user_name'],
            'user_email' => $validated['user_email'] ?? null,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'is_approved' => true, // Auto-approve for verified purchasers
            'is_verified_purchase' => true, // Always true since we check for order
        ]);

        // Update product rating only if approved
        if ($isApproved) {
            $this->updateProductRating($product);
        }

        return response()->json([
            'success' => true,
            'message' => $isApproved 
                ? 'Отзыв успешно добавлен' 
                : 'Отзыв отправлен на модерацию',
            'data' => $review->load('user:id,name')
        ], 201);
    }

    /**
     * Update product rating based on approved reviews
     */
    private function updateProductRating(Product $product): void
    {
        $approvedReviews = $product->allReviews()->where('is_approved', true)->get();
        
        if ($approvedReviews->count() > 0) {
            $averageRating = $approvedReviews->avg('rating');
            $reviewsCount = $approvedReviews->count();
            
            $product->update([
                'rating' => round($averageRating, 2),
                'reviews_count' => $reviewsCount,
            ]);
        }
    }
}
