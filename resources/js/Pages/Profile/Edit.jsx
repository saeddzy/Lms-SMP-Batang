import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <DashboardLayout title="Profile">
            <Head title="Profile" />

            <div className="space-y-6">
                <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </DashboardLayout>
    );
}
