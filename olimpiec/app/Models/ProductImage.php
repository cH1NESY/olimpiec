<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'image_path',
        'sort_order',
        'is_main',
    ];

    protected $casts = [
        'is_main' => 'boolean',
    ];

    /**
     * Get the full URL for the image
     */
    public function getImageUrlAttribute()
    {
        if (!$this->image_path) {
            return null;
        }

        // If it's already a full URL, return as is
        if (filter_var($this->image_path, FILTER_VALIDATE_URL)) {
            return $this->image_path;
        }

        // If it starts with /storage, return as is (already public URL)
        if (str_starts_with($this->image_path, '/storage/')) {
            return $this->image_path;
        }

        // If it starts with storage/, add leading slash
        if (str_starts_with($this->image_path, 'storage/')) {
            return '/' . $this->image_path;
        }

        // For paths like "products/filename.jpg", add /storage/ prefix
        // This is the most common case when using storeAs('products', ...)
        return '/storage/' . ltrim($this->image_path, '/');
    }

    /**
     * Append image_url to array/json representation
     */
    protected $appends = ['image_url'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
