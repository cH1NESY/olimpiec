<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $brands = Brand::orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $brands
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
            'logo' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Brand::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Бренд успешно создан',
            'data' => $brand
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $brand = Brand::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $brand
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
        ]);

        // Update slug if name changed
        if ($brand->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Brand::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $brand->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Бренд успешно обновлен',
            'data' => $brand
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $brand = Brand::findOrFail($id);
        
        // Check if brand has products
        if ($brand->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Невозможно удалить бренд, так как у него есть товары'
            ], 400);
        }

        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => 'Бренд успешно удален'
        ]);
    }
}
