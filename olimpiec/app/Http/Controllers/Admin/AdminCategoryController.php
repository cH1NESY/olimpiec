<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        // Get all categories (both root and children) for admin panel
        $allCategories = Category::with('parent')
            ->orderBy('sort_order')
            ->orderBy('id', 'asc')
            ->get();

        // Also return root categories with children for tree structure
        $rootCategories = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rootCategories, // For backward compatibility
            'all' => $allCategories // Flat list of all categories
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
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'integer|min:0',
        ]);

        // Convert empty string to null for parent_id
        if (isset($validated['parent_id']) && ($validated['parent_id'] === '' || $validated['parent_id'] === null)) {
            $validated['parent_id'] = null;
        } elseif (isset($validated['parent_id'])) {
            $validated['parent_id'] = (int)$validated['parent_id'];
        }

        $validated['slug'] = Str::slug($validated['name']);
        
        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Category::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Категория успешно создана',
            'data' => $category
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $category = Category::with('children')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'integer|min:0',
        ]);

        // Convert empty string to null for parent_id
        if (isset($validated['parent_id']) && ($validated['parent_id'] === '' || $validated['parent_id'] === null)) {
            $validated['parent_id'] = null;
        } elseif (isset($validated['parent_id'])) {
            $validated['parent_id'] = (int)$validated['parent_id'];
        }

        // Prevent category from being its own parent
        if ($validated['parent_id'] == $id) {
            return response()->json([
                'success' => false,
                'message' => 'Категория не может быть родительской для самой себя'
            ], 400);
        }

        // Prevent circular references (parent cannot be a child of this category)
        if ($validated['parent_id']) {
            $parent = Category::find($validated['parent_id']);
            if ($parent && $this->isDescendant($parent, $id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Невозможно установить родительскую категорию: это создаст циклическую ссылку'
                ], 400);
            }
        }

        // Update slug if name changed
        if ($category->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Category::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Категория успешно обновлена',
            'data' => $category->load('children')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        
        // Check if category has products
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Невозможно удалить категорию, так как в ней есть товары'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Категория успешно удалена'
        ]);
    }

    /**
     * Check if a category is a descendant of another category
     */
    private function isDescendant(Category $category, int $ancestorId): bool
    {
        if ($category->parent_id == $ancestorId) {
            return true;
        }
        
        if ($category->parent_id === null) {
            return false;
        }
        
        $parent = Category::find($category->parent_id);
        if (!$parent) {
            return false;
        }
        
        return $this->isDescendant($parent, $ancestorId);
    }
}
