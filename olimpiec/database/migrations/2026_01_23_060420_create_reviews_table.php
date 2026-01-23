<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('user_name'); // Имя пользователя (может быть анонимным)
            $table->string('user_email')->nullable(); // Email пользователя
            $table->integer('rating'); // Рейтинг от 1 до 5
            $table->text('comment')->nullable(); // Текст отзыва
            $table->boolean('is_approved')->default(false); // Одобрен ли отзыв модератором
            $table->boolean('is_verified_purchase')->default(false); // Подтвержденная покупка
            $table->timestamps();
            
            $table->index(['product_id', 'is_approved']);
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
