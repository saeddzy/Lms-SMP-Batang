<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Izin materials edit dipakai MaterialPolicy::update & UI toggle materi;
     * sebelumnya tidak ada di seeder sehingga guru tidak lolos hasPermission.
     */
    public function up(): void
    {
        $permission = Permission::firstOrCreate(
            ['name' => 'materials edit'],
            ['guard_name' => config('auth.defaults.guard', 'web')]
        );

        foreach (['admin', 'guru'] as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if ($role && ! $role->hasPermissionTo($permission)) {
                $role->givePermissionTo($permission);
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        $permission = Permission::where('name', 'materials edit')->first();
        if (! $permission) {
            return;
        }

        foreach (['admin', 'guru'] as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $role->revokePermissionTo($permission);
            }
        }

        $permission->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
