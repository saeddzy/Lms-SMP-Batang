import { useCallback, useEffect, useState } from "react";
import Content from "@/Layouts/Dashboard/Content";
import Header from "@/Layouts/Dashboard/Header";
import Sidebar from "@/Layouts/Dashboard/Sidebar";

const STORAGE_KEY = "dashboard-sidebar-collapsed";

export default function DashboardLayout({
    children,
    title,
    header,
    showHeaderLogo = true,
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                setCollapsed(JSON.parse(saved));
            }
        } catch {
            /* ignore */
        }
        setHydrated(true);
    }, []);

    const toggleCollapsed = useCallback(() => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                /* ignore */
            }
            return next;
        });
    }, []);

    const openMobile = useCallback(() => setMobileOpen(true), []);
    const closeMobile = useCallback(() => setMobileOpen(false), []);

    useEffect(() => {
        if (!mobileOpen) {
            return undefined;
        }
        const onKey = (e) => {
            if (e.key === "Escape") {
                closeMobile();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mobileOpen, closeMobile]);

    const displayTitle = title ?? header;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar
                collapsed={hydrated ? collapsed : false}
                onToggleCollapse={toggleCollapsed}
                mobileOpen={mobileOpen}
                onCloseMobile={closeMobile}
            />

            <div
                className={
                    hydrated && collapsed
                        ? "flex min-h-screen flex-col transition-[margin] duration-200 ease-out lg:ml-[4.5rem]"
                        : "flex min-h-screen flex-col transition-[margin] duration-200 ease-out lg:ml-64"
                }
            >
                <Header
                    title={displayTitle}
                    onOpenMobileSidebar={openMobile}
                    showLogo={showHeaderLogo}
                />
                <Content>{children}</Content>
            </div>
        </div>
    );
}
