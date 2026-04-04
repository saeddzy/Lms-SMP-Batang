import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard() {
    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
                <div className="p-6 text-gray-700">
                    You&apos;re logged in!
                </div>
            </div>
        </DashboardLayout>
    );
}
