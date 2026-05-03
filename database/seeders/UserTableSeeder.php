<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user (login: NIP atau email lama)
        $admin = User::updateOrCreate(
            ['email' => 'izaldev@gmail.com'],
            [
                'name' => 'Syahrizaldev',
                'nip' => '198001012009011001',
                'password' => bcrypt('password'),
            ],
        );

        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }

        // Create teacher user
        $teacher = User::updateOrCreate(
            ['email' => 'guru@example.com'],
            [
                'name' => 'Guru SMP',
                'nip' => '198502152010012002',
                'password' => bcrypt('password'),
            ],
        );

        $teacherRole = Role::where('name', 'guru')->first();
        if ($teacherRole) {
            $teacher->assignRole($teacherRole);
        }

        // Create student user
        $student = User::updateOrCreate(
            ['email' => 'siswa@example.com'],
            [
                'name' => 'Siswa SMP',
                'nis' => '2024123456',
                'password' => bcrypt('password'),
            ],
        );

        $studentRole = Role::where('name', 'siswa')->first();
        if ($studentRole) {
            $student->assignRole($studentRole);
        }
    }
}
