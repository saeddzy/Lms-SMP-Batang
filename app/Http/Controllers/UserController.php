<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
class UserController extends Controller implements HasMiddleware
{

    public static function middleware()
    {
        return [
            new Middleware('permission:users index', only : ['index']),
            new Middleware('permission:users create', only : ['create', 'store']),
            new Middleware('permission:users edit', only : ['edit', 'update']),
            new Middleware('permission:users delete', only : ['destroy']),
        ];
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // get all users
        $users = User::with('roles')
            ->when(request('search'), function ($query) {
                $s = '%'.request('search').'%';
                $query->where(function ($q) use ($s) {
                    $q->where('name', 'like', $s)
                        ->orWhere('email', 'like', $s)
                        ->orWhere('nis', 'like', $s)
                        ->orWhere('nip', 'like', $s);
                });
            })
            ->latest()
            ->paginate(6);

        // render view
        return inertia('Users/Index', ['users' => $users,'filters' => $request->only(['search'])]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
         // get roles
         $roles = Role::latest()->get();
         // render view
         return inertia('Users/Create', ['roles' => $roles]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         // validate request
        $request->validate([
            'name' => 'required|min:3|max:255',
            'nis' => ['nullable', 'string', 'max:32', Rule::unique('users', 'nis')],
            'nip' => ['nullable', 'string', 'max:32', Rule::unique('users', 'nip')],
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => 'required|confirmed|min:4',
            'selectedRoles' => 'required|array|min:1',
        ]);

        $this->validateRoleIdentifiers($request);

        // create user
        $user = User::create([
            'name' => $request->name,
            'nis' => $request->filled('nis') ? trim((string) $request->nis) : null,
            'nip' => $request->filled('nip') ? trim((string) $request->nip) : null,
            'email' => $request->filled('email') ? strtolower(trim((string) $request->email)) : null,
            'password' => bcrypt($request->password),
        ]);

        // attach roles
        $user->assignRole($request->selectedRoles);

        // render view
        return to_route('users.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        // get roles
        $roles = Role::where('name', '!=', 'super-admin')->get();

        // load roles
        $user->load('roles');

        // render view
        return inertia('Users/Edit', ['user' => $user, 'roles' => $roles]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        // validate request
        $request->validate([
            'name' => 'required|min:3|max:255',
            'nis' => ['nullable', 'string', 'max:32', Rule::unique('users', 'nis')->ignore($user->id)],
            'nip' => ['nullable', 'string', 'max:32', Rule::unique('users', 'nip')->ignore($user->id)],
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'selectedRoles' => 'required|array|min:1',
        ]);

        $this->validateRoleIdentifiers($request);

        // update user data
        $user->update([
            'name' => $request->name,
            'nis' => $request->filled('nis') ? trim((string) $request->nis) : null,
            'nip' => $request->filled('nip') ? trim((string) $request->nip) : null,
            'email' => $request->filled('email') ? strtolower(trim((string) $request->email)) : null,
        ]);

        // attach roles
        $user->syncRoles($request->selectedRoles);

        // render view
        return to_route('users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // delete user data
        $user->delete();

        // render view
        return back();
    }

    /**
     * Pastikan NIS / NIP sesuai role yang dipilih.
     */
    private function validateRoleIdentifiers(Request $request): void
    {
        $roles = collect($request->selectedRoles ?? []);

        if ($roles->contains('siswa') && ! filled(trim((string) $request->nis))) {
            throw ValidationException::withMessages([
                'nis' => 'NIS wajib diisi untuk peran Siswa.',
            ]);
        }

        if ($roles->intersect(['guru', 'admin', 'super-admin'])->isNotEmpty() && ! filled(trim((string) $request->nip))) {
            throw ValidationException::withMessages([
                'nip' => 'NIP wajib diisi untuk peran Guru atau Admin.',
            ]);
        }
    }
}
