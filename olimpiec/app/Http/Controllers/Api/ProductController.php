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

        // Filter by brand (support multiple brands)
        if ($request->has('brand')) {
            $brandSlug = $request->get('brand');
            $query->whereHas('brand', function ($q) use ($brandSlug) {
                $q->where('slug', $brandSlug);
            });
        }
        // Support multiple brands via brands parameter (comma-separated)
        if ($request->has('brands')) {
            $brandSlugs = explode(',', $request->get('brands'));
            $query->whereHas('brand', function ($q) use ($brandSlugs) {
                $q->whereIn('slug', $brandSlugs);
            });
        }

        // Filter by gender (support multiple genders)
        if ($request->has('gender')) {
            $query->where('gender', $request->get('gender'));
        }
        // Support multiple genders via genders parameter (comma-separated)
        if ($request->has('genders')) {
            $genders = explode(',', $request->get('genders'));
            $query->whereIn('gender', $genders);
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

        // Filter by size (support multiple sizes)
        if ($request->has('size')) {
            $sizeId = $request->get('size');
            $query->whereHas('sizes', function ($q) use ($sizeId) {
                $q->where('sizes.id', $sizeId);
            });
        }
        // Support multiple sizes via sizes parameter (comma-separated)
        if ($request->has('sizes')) {
            $sizeIds = array_map('intval', explode(',', $request->get('sizes')));
            $query->whereHas('sizes', function ($q) use ($sizeIds) {
                $q->whereIn('sizes.id', $sizeIds);
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Handle sort parameter from frontend (price_asc, price_desc, newest, popular, rating)
        if ($request->has('sort')) {
            $sortParam = $request->get('sort');
            switch ($sortParam) {
                case 'price_asc':
                    $sortBy = 'price';
                    $sortOrder = 'asc';
                    break;
                case 'price_desc':
                    $sortBy = 'price';
                    $sortOrder = 'desc';
                    break;
                case 'newest':
                    $sortBy = 'created_at';
                    $sortOrder = 'desc';
                    break;
                case 'popular':
                    $sortBy = 'sales_count';
                    $sortOrder = 'desc';
                    break;
                case 'rating':
                    $sortBy = 'rating';
                    $sortOrder = 'desc';
                    break;
                default:
                    $sortBy = 'created_at';
                    $sortOrder = 'desc';
            }
        }

        $allowedSorts = ['price', 'created_at', 'rating', 'sales_count', 'name'];
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
        $product = Product::with(['brand', 'category', 'images', 'sizes', 'characteristics', 'reviews' => function($query) {
            $query->with('user:id,name')->orderBy('created_at', 'desc')->limit(5);
        }])
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
        // Validate and sanitize search query
        $validated = $request->validate([
            'q' => 'required|string|max:255|min:1',
        ]);
        
        $query = trim($validated['q']);
        
        // Additional sanitization to prevent SQL injection
        $query = mb_substr($query, 0, 255); // Limit length
        $query = preg_replace('/[^\p{L}\p{N}\s\-_]/u', '', $query); // Remove special characters except letters, numbers, spaces, hyphens, underscores
        
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
            // Use parameterized queries to prevent SQL injection
            // All user input is properly escaped via parameter binding
            $lowerSearchTerm = '%' . mb_strtolower($query, 'UTF-8') . '%';
            
            $products = Product::with(['brand', 'category', 'images'])
                ->where('is_active', true)
                ->where(function ($q) use ($lowerSearchTerm) {
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
