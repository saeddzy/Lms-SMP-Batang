<?php

namespace App\Http\Middleware;

use App\Models\ClassSubject;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $hasTeachingSlot = $user && $user->hasRole('guru')
            ? ClassSubject::where('teacher_id', $user->id)->exists()
            : (bool) $user?->hasRole('admin');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $user ? $user->getUserPermissions() : [],
                'roles' => $user
                    ? $user->getRoleNames()->values()->all()
                    : [],
                /** Guru pengampu minimal satu slot kelas–mapel — bukan sekadar wali tanpa pengampuan */
                'canMutateTeachingContent' => $user
                    ? ($user->hasRole('admin') || ($user->hasRole('guru') && $hasTeachingSlot))
                    : false,
                'canInputGrades' => $user
                    ? ($user->hasRole('admin')
                        || ($user->hasRole('guru')
                            && $user->can('grades calculate')
                            && ClassSubject::where('teacher_id', $user->id)->exists()))
                    : false,
            ],
        ];
    }
}

