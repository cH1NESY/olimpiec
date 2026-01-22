<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get products with filters and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'category', 'images', 'sizes', 'characteristics'])
            ->where('is_active', true);

        // Filter by category
        if ($request->has('category') && $request->get('category')) {
            $categorySlug = $request->get('category');
            $category = \App\Models\Category::where('slug', $categorySlug)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Filter by brand
        if ($request->has('brand')) {
            $query->whereHas('brand', function ($q) use ($request) {
                $q->where('slug', $request->get('brand'));
            });
        }

        // Filter by gender
        if ($request->has('gender')) {
            $query->where('gender', $request->get('gender'));
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        // Filter by new products
        if ($request->has('is_new') && $request->get('is_new') === 'true') {
            $query->where('is_new', true);
        }

        // Filter by size
        if ($request->has('size')) {
            $query->whereHas('sizes', function ($q) use ($request) {
                $q->where('sizes.id', $request->get('size'));
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSorts = ['price', 'created_at', 'rating', 'sales_count'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    /**
     * Get product by ID
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['brand', 'category', 'images', 'sizes', 'characteristics'])
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Search products
     */
    public function search(Request $request): JsonResponse
    {
        $query = trim($request->get('q', ''));
        
        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => [],
                'meta' => [
                    'total' => 0
                ]
            ]);
        }

        try {
            // Use case-insensitive search with LIKE
            $searchTerm = '%' . $query . '%';
            $lowerSearchTerm = '%' . mb_strtolower($query, 'UTF-8') . '%';
            
            $products = Product::with(['brand', 'category', 'images'])
                ->where('is_active', true)
                ->where(function ($q) use ($lowerSearchTerm, $searchTerm) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$lowerSearchTerm])
                      ->orWhereRaw('LOWER(description) LIKE ?', [$lowerSearchTerm])
                      ->orWhereRaw('LOWER(full_description) LIKE ?', [$lowerSearchTerm]);
                })
                ->orderBy('name', 'asc')
                ->limit(20)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $products->values()->all(),
                'meta' => [
                    'total' => $products->count()
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Search error: ' . $e->getMessage(), [
                'query' => $query,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при поиске',
                'data' => [],
                'meta' => [
                    'total' => 0
                ]
            ], 500);
        }
    }
}
