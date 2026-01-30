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
Route::post('/products/{productId}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'store'])->middleware(['auth:sanctum', 'throttle:5,1']); // 5 reviews per minute

Route::get('/stores', [StoreController::class, 'index']);

// Auth routes with stricter rate limiting
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1'); // 5 requests per minute
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // 5 requests per minute
Route::post('/auth/telegram', [\App\Http\Controllers\Api\TelegramAuthController::class, 'auth'])->middleware('throttle:10,1'); // Telegram auth

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/user', [AuthController::class, 'update']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'store'])->middleware('throttle:10,1'); // 10 orders per minute
});

// Payment routes (public for webhook, protected for creating payment)
Route::post('/payments/webhook', [\App\Http\Controllers\Api\PaymentController::class, 'webhook'])->middleware('throttle:100,1'); // Higher limit for webhooks
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments/create', [\App\Http\Controllers\Api\PaymentController::class, 'createPayment'])->middleware('throttle:10,1'); // 10 requests per minute
    Route::get('/payments/status/{orderId}', [\App\Http\Controllers\Api\PaymentController::class, 'checkStatus'])->middleware('throttle:30,1'); // 30 requests per minute
});

// Admin routes
Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->group(function () {
    // Products
    Route::apiResource('products', \App\Http\Controllers\Admin\AdminProductController::class);
    Route::post('products/{id}/images', [\App\Http\Controllers\Admin\AdminProductController::class, 'uploadImages']);
    Route::delete('products/{productId}/images/{imageId}', [\App\Http\Controllers\Admin\AdminProductController::class, 'deleteImage']);
    Route::put('products/{id}/images/order', [\App\Http\Controllers\Admin\AdminProductController::class, 'updateImageOrder']);
    
    // Categories
    Route::apiResource('categories', \App\Http\Controllers\Admin\AdminCategoryController::class);
    
    // Brands
    Route::apiResource('brands', \App\Http\Controllers\Admin\AdminBrandController::class);
    
    // Orders
    Route::get('orders', [\App\Http\Controllers\Admin\AdminOrderController::class, 'index']);
    Route::get('orders/{id}', [\App\Http\Controllers\Admin\AdminOrderController::class, 'show']);
    Route::put('orders/{id}/status', [\App\Http\Controllers\Admin\AdminOrderController::class, 'updateStatus']);
});
