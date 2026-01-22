<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    /**
     * Get all stores
     */
    public function index(): JsonResponse
    {
        $stores = Store::all();

        return response()->json([
            'success' => true,
            'data' => $stores
        ]);
    }
}
