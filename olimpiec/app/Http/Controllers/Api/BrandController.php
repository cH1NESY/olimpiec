<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    /**
     * Get all brands
     */
    public function index(): JsonResponse
    {
        $brands = Brand::orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $brands
        ]);
    }
}
