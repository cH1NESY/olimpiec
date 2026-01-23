<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Size;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'category', 'images', 'sizes']);

        // Search
        if ($request->has('search') && $request->get('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->get('category_id'));
        }

        // Filter by brand
        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->get('brand_id'));
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->get('is_active') === 'true');
        }

        $perPage = $request->get('per_page', 20);
        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

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
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'old_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'gender' => 'required|in:male,female,unisex',
            'is_new' => 'boolean',
            'is_active' => 'boolean',
            'sku' => 'nullable|string|unique:products,sku',
            'stock_quantity' => 'integer|min:0',
            'sizes' => 'nullable|array',
            'sizes.*' => 'exists:sizes,id',
            'characteristics' => 'nullable|array',
            'characteristics.*.name' => 'required|string',
            'characteristics.*.value' => 'required|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Product::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $product = Product::create($validated);

        // Attach sizes
        if (isset($validated['sizes'])) {
            $product->sizes()->sync($validated['sizes']);
        }

        // Create characteristics
        if (isset($validated['characteristics'])) {
            foreach ($validated['characteristics'] as $index => $char) {
                $product->characteristics()->create([
                    'name' => $char['name'],
                    'value' => $char['value'],
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Товар успешно создан',
            'data' => $product->load(['brand', 'category', 'images', 'sizes', 'characteristics'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::with(['brand', 'category', 'images', 'sizes', 'characteristics'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'old_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'gender' => 'required|in:male,female,unisex',
            'is_new' => 'boolean',
            'is_active' => 'boolean',
            'sku' => 'nullable|string|unique:products,sku,' . $id,
            'stock_quantity' => 'integer|min:0',
            'sizes' => 'nullable|array',
            'sizes.*' => 'exists:sizes,id',
            'characteristics' => 'nullable|array',
            'characteristics.*.name' => 'required|string',
            'characteristics.*.value' => 'required|string',
        ]);

        // Update slug if name changed
        if ($product->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Product::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $product->update($validated);

        // Sync sizes
        if (isset($validated['sizes'])) {
            $product->sizes()->sync($validated['sizes']);
        }

        // Update characteristics
        if (isset($validated['characteristics'])) {
            $product->characteristics()->delete();
            foreach ($validated['characteristics'] as $index => $char) {
                $product->characteristics()->create([
                    'name' => $char['name'],
                    'value' => $char['value'],
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Товар успешно обновлен',
            'data' => $product->load(['brand', 'category', 'images', 'sizes', 'characteristics'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Товар успешно удален'
        ]);
    }
}
