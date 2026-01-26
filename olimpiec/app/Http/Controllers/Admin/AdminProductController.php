<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Size;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

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
        $products = $query->orderBy('id', 'desc')->paginate($perPage);

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
            'sizes.*.size_id' => 'required|exists:sizes,id',
            'sizes.*.stock_quantity' => 'nullable|integer|min:0',
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
            $syncData = [];
            foreach ($validated['sizes'] as $sizeData) {
                $syncData[$sizeData['size_id']] = ['stock_quantity' => $sizeData['stock_quantity'] ?? 0];
            }
            $product->sizes()->sync($syncData);
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
            'sizes.*.size_id' => 'required|exists:sizes,id',
            'sizes.*.stock_quantity' => 'nullable|integer|min:0',
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
            $syncData = [];
            foreach ($validated['sizes'] as $sizeData) {
                $syncData[$sizeData['size_id']] = ['stock_quantity' => $sizeData['stock_quantity'] ?? 0];
            }
            $product->sizes()->sync($syncData);
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

    /**
     * Upload images for a product
     */
    public function uploadImages(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        $uploadedImages = [];

        DB::beginTransaction();
        try {
            foreach ($request->file('images') as $index => $file) {
                // Generate unique filename
                $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                
                // Store file in public storage
                $path = $file->storeAs('products', $filename, 'public');
                
                // Get the highest sort_order for this product
                $maxSortOrder = ProductImage::where('product_id', $product->id)->max('sort_order') ?? -1;
                
                // Check if this is the first image (should be main)
                $isMain = ProductImage::where('product_id', $product->id)->count() === 0;
                
                // Create image record
                $image = ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'sort_order' => $maxSortOrder + 1 + $index,
                    'is_main' => $isMain && $index === 0,
                ]);

                // Reload image to get accessor
                $image->refresh();
                
                $uploadedImages[] = [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'image_url' => $image->image_url,
                    'sort_order' => $image->sort_order,
                    'is_main' => $image->is_main,
                ];
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Изображения успешно загружены',
                'data' => $uploadedImages
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Clean up uploaded files on error
            foreach ($uploadedImages as $img) {
                if (isset($img['image_path'])) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $img['image_path']));
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке изображений: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an image
     */
    public function deleteImage(string $productId, string $imageId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $image = ProductImage::where('product_id', $product->id)
            ->findOrFail($imageId);

        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }

            // If this was the main image, set another one as main
            if ($image->is_main) {
                $nextImage = ProductImage::where('product_id', $product->id)
                    ->where('id', '!=', $image->id)
                    ->orderBy('sort_order')
                    ->first();
                
                if ($nextImage) {
                    $nextImage->update(['is_main' => true]);
                }
            }

            // Delete image record
            $image->delete();

            return response()->json([
                'success' => true,
                'message' => 'Изображение успешно удалено'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении изображения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update image order and main status
     */
    public function updateImageOrder(Request $request, string $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:product_images,id',
            'images.*.sort_order' => 'required|integer',
            'images.*.is_main' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->input('images') as $imageData) {
                $image = ProductImage::where('product_id', $product->id)
                    ->findOrFail($imageData['id']);

                $updateData = [
                    'sort_order' => $imageData['sort_order'],
                ];

                // If this image is marked as main, unset others
                if (isset($imageData['is_main']) && $imageData['is_main']) {
                    ProductImage::where('product_id', $product->id)
                        ->where('id', '!=', $image->id)
                        ->update(['is_main' => false]);
                    $updateData['is_main'] = true;
                }

                $image->update($updateData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Порядок изображений обновлен'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при обновлении порядка: ' . $e->getMessage()
            ], 500);
        }
    }
}
