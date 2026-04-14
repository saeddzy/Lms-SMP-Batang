<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;

class TestUserCreate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-user-create';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test user creation functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing user creation...');

        // Create a mock request
        $requestData = [
            'name' => 'Test User',
            'email' => 'test' . time() . '@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'selectedRoles' => ['guru']
        ];

        $request = new Request();
        $request->merge($requestData);

        $controller = new UserController();

        try {
            $response = $controller->store($request);
            $this->info('User creation successful!');
            $this->info('Response: ' . $response);
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->error('File: ' . $e->getFile() . ':' . $e->getLine());
        }
    }
}
