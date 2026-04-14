<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        //permission users
        Permission::firstOrCreate(['name' => 'users index', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'users create', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'users edit', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'users delete', 'guard_name' => 'web']);

        //permission roles
        Permission::firstOrCreate(['name' => 'roles index', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'roles create', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'roles edit', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'roles delete', 'guard_name' => 'web']);

        //permission permissions
        Permission::firstOrCreate(['name' => 'permissions index', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'permissions create', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'permissions edit', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'permissions delete', 'guard_name' => 'web']);

       
    }
}
