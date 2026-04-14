import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard() {
    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
                <div className="p-8 text-sm text-stone-600">
                    You&apos;re logged in!
                </div>
            </div>
        </DashboardLayout>
    );
}
