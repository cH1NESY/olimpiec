<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\StoreController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/sizes', [SizeController::class, 'index']);

// Products routes - search must be BEFORE {id} route
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Reviews routes
Route::get('/products/{productId}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'index']);
Route::get('/products/{productId}/can-review', [\App\Http\Controllers\Api\ReviewController::class, 'canReview'])->middleware('auth:sanctum');
Route::post('/products/{productId}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'store'])->middleware('auth:sanctum');

Route::get('/stores', [StoreController::class, 'index']);

// Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/user', [AuthController::class, 'update']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'store']);
});

// Payment routes (public for webhook, protected for creating payment)
Route::post('/payments/webhook', [\App\Http\Controllers\Api\PaymentController::class, 'webhook']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments/create', [\App\Http\Controllers\Api\PaymentController::class, 'createPayment']);
    Route::get('/payments/status/{orderId}', [\App\Http\Controllers\Api\PaymentController::class, 'checkStatus']);
});

// Admin routes
Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->group(function () {
    // Products
    Route::apiResource('products', \App\Http\Controllers\Admin\AdminProductController::class);
    
    // Categories
    Route::apiResource('categories', \App\Http\Controllers\Admin\AdminCategoryController::class);
    
    // Brands
    Route::apiResource('brands', \App\Http\Controllers\Admin\AdminBrandController::class);
    
    // Orders
    Route::get('orders', [\App\Http\Controllers\Admin\AdminOrderController::class, 'index']);
    Route::get('orders/{id}', [\App\Http\Controllers\Admin\AdminOrderController::class, 'show']);
    Route::put('orders/{id}/status', [\App\Http\Controllers\Admin\AdminOrderController::class, 'updateStatus']);
});
