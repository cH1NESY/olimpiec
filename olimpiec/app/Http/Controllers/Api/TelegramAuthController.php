<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TelegramAuthController extends Controller
{
    /**
     * Authenticate user via Telegram Web App
     * Validates Telegram initData and creates/updates user
     */
    public function auth(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'init_data' => 'required|string',
        ]);

        // Parse Telegram initData
        $initData = $this->parseInitData($validated['init_data']);
        
        if (!$initData) {
            return response()->json([
                'success' => false,
                'message' => 'Неверные данные Telegram'
            ], 400);
        }

        // Verify Telegram hash (security check)
        if (!$this->verifyTelegramHash($validated['init_data'], $initData)) {
            return response()->json([
                'success' => false,
                'message' => 'Неверная подпись данных Telegram'
            ], 400);
        }

        $telegramId = $initData['user']['id'] ?? null;
        $username = $initData['user']['username'] ?? null;
        $firstName = $initData['user']['first_name'] ?? null;
        $lastName = $initData['user']['last_name'] ?? null;
        $photoUrl = $initData['user']['photo_url'] ?? null;

        if (!$telegramId) {
            return response()->json([
                'success' => false,
                'message' => 'ID пользователя Telegram не найден'
            ], 400);
        }

        // Find or create user
        $user = User::where('telegram_id', $telegramId)->first();

        if ($user) {
            // Update user data
            $user->update([
                'telegram_username' => $username,
                'telegram_first_name' => $firstName,
                'telegram_last_name' => $lastName,
                'telegram_photo_url' => $photoUrl,
                'is_telegram_user' => true,
            ]);

            // Update name if not set
            if (!$user->name && $firstName) {
                $user->name = trim(($firstName ?? '') . ' ' . ($lastName ?? ''));
            }
            $user->save();
        } else {
            // Create new user
            $user = User::create([
                'telegram_id' => $telegramId,
                'telegram_username' => $username,
                'telegram_first_name' => $firstName,
                'telegram_last_name' => $lastName,
                'telegram_photo_url' => $photoUrl,
                'is_telegram_user' => true,
                'name' => trim(($firstName ?? '') . ' ' . ($lastName ?? '')),
                'email' => $username ? $username . '@telegram.local' : 'telegram_' . $telegramId . '@telegram.local',
                'password' => Hash::make(Str::random(32)), // Random password for Telegram users
            ]);
        }

        // Create or get token
        $token = $user->createToken('telegram_auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Авторизация через Telegram успешна',
            'data' => [
                'user' => $user,
                'token' => $token,
            ]
        ]);
    }

    /**
     * Parse Telegram initData string
     */
    private function parseInitData(string $initData): ?array
    {
        $data = [];
        parse_str($initData, $data);

        if (isset($data['user'])) {
            $data['user'] = json_decode($data['user'], true);
        }

        return $data;
    }

    /**
     * Verify Telegram hash
     */
    private function verifyTelegramHash(string $initData, array $parsedData): bool
    {
        $botToken = config('services.telegram.bot_token');
        
        if (!$botToken) {
            // In development, skip verification if token not set
            return config('app.debug', false);
        }

        $hash = $parsedData['hash'] ?? null;
        if (!$hash) {
            return false;
        }

        // Remove hash from data
        unset($parsedData['hash']);
        
        // Create data check string
        $dataCheckArray = [];
        foreach ($parsedData as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            }
            $dataCheckArray[] = $key . '=' . $value;
        }
        sort($dataCheckArray);
        $dataCheckString = implode("\n", $dataCheckArray);

        // Create secret key
        $secretKey = hash_hmac('sha256', $botToken, 'WebAppData', true);
        
        // Calculate hash
        $calculatedHash = bin2hex(hash_hmac('sha256', $dataCheckString, $secretKey, true));

        return hash_equals($calculatedHash, $hash);
    }
}
