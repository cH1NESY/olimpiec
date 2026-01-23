<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\JsonResponse;

class SizeController extends Controller
{
    /**
     * Get all sizes
     */
    public function index(): JsonResponse
    {
        $sizes = Size::orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $sizes
        ]);
    }
}
