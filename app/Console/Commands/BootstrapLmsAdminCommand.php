<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BootstrapLmsAdminCommand extends Command
{
    protected $signature = 'lms:bootstrap-admin';

    protected $description = 'Seed ulang role, permission, dan akun demo (admin/guru/siswa) — pakai saat DB kosong atau tidak bisa login';

    public function handle(): int
    {
        $this->warn('Menjalankan seed minimal (tanpa data akademik).');

        $this->call('db:seed', ['--class' => \Database\Seeders\RolesTableSeeder::class, '--force' => true]);
        $this->call('db:seed', ['--class' => \Database\Seeders\PermissionsTableSeeder::class, '--force' => true]);
        $this->call('db:seed', ['--class' => \Database\Seeders\LmsPermissionsTableSeeder::class, '--force' => true]);
        $this->call('db:seed', ['--class' => \Database\Seeders\RolePermissionsTableSeeder::class, '--force' => true]);
        $this->call('db:seed', ['--class' => \Database\Seeders\UserTableSeeder::class, '--force' => true]);

        $this->newLine();
        $this->info('Akun demo siap (password untuk ketiganya: password)');
        $this->table(
            ['Peran', 'Login (email atau NIS/NIP)', 'Catatan'],
            [
                ['Admin', 'izaldev@gmail.com atau NIP 198001012009011001', 'Kelola user di /users'],
                ['Guru', 'guru@example.com atau NIP 198502152010012002', '—'],
                ['Siswa', 'siswa@example.com atau NIS 2024123456', '—'],
            ]
        );
        $this->comment('Segera ubah password setelah login di lingkungan produksi.');

        return self::SUCCESS;
    }
}
