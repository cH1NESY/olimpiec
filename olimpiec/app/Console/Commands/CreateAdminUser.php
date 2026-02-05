<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create 
                            {--name= : Имя администратора}
                            {--email= : Email администратора}
                            {--password= : Пароль администратора}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Создать администратора';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔐 Создание администратора...');
        $this->newLine();

        // Получаем данные
        $name = $this->option('name') ?: $this->ask('Введите имя администратора');
        $email = $this->option('email') ?: $this->ask('Введите email администратора');
        
        // Проверка существования пользователя
        if (User::where('email', $email)->exists()) {
            $this->error("❌ Пользователь с email {$email} уже существует!");
            
            if (!$this->confirm('Хотите сделать этого пользователя администратором?', false)) {
                return Command::FAILURE;
            }
            
            $user = User::where('email', $email)->first();
            $user->is_admin = true;
            $user->save();
            
            $this->info("✅ Пользователь {$email} теперь администратор!");
            return Command::SUCCESS;
        }

        // Валидация email
        $validator = Validator::make(['email' => $email], [
            'email' => 'required|email|unique:users,email',
        ]);

        if ($validator->fails()) {
            $this->error('❌ Ошибка валидации:');
            foreach ($validator->errors()->all() as $error) {
                $this->error("   - {$error}");
            }
            return Command::FAILURE;
        }

        // Получаем пароль
        $password = $this->option('password');
        if (!$password) {
            $password = $this->secret('Введите пароль (минимум 8 символов)');
            $passwordConfirmation = $this->secret('Подтвердите пароль');
            
            if ($password !== $passwordConfirmation) {
                $this->error('❌ Пароли не совпадают!');
                return Command::FAILURE;
            }
            
            if (strlen($password) < 8) {
                $this->error('❌ Пароль должен содержать минимум 8 символов!');
                return Command::FAILURE;
            }
        }

        // Создаем пользователя
        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'is_admin' => true,
            ]);

            $this->newLine();
            $this->info('✅ Администратор успешно создан!');
            $this->newLine();
            $this->table(
                ['Поле', 'Значение'],
                [
                    ['ID', $user->id],
                    ['Имя', $user->name],
                    ['Email', $user->email],
                    ['Администратор', $user->is_admin ? 'Да' : 'Нет'],
                    ['Создан', $user->created_at->format('Y-m-d H:i:s')],
                ]
            );
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Ошибка при создании администратора:');
            $this->error("   {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
