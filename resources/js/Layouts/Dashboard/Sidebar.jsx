import { Link } from "@inertiajs/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import hasAnyPermission from "@/Utils/Permissions";
import ApplicationLogo from "@/Components/ApplicationLogo";
import {
    IconChevronLeft,
    IconChevronRight,
    IconLayoutDashboard,
    IconLock,
    IconShield,
    IconUsers,
    IconX,
} from "@tabler/icons-react";

const iconProps = { stroke: 1.5, className: "h-5 w-5 shrink-0" };

function NavItem({ href, label, icon: Icon, active, collapsed, onNavigate }) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={clsx(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                    ? "bg-gray-100 text-gray-900 shadow-sm ring-1 ring-gray-200/80"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2"
            )}
        >
            <span
                className={clsx(
                    "flex shrink-0",
                    active && "text-indigo-600",
                    !active && "text-gray-500 group-hover:text-gray-700"
                )}
            >
                <Icon {...iconProps} />
            </span>
            {!collapsed && (
                <span className="truncate">{label}</span>
            )}
            {active && !collapsed && (
                <span className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
            )}
        </Link>
    );
}

export default function Sidebar({
    collapsed,
    onToggleCollapse,
    mobileOpen,
    onCloseMobile,
}) {
    const [isLg, setIsLg] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        setIsLg(mq.matches);
        const onChange = () => setIsLg(mq.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    /** Collapse (icon-only) hanya di layar besar; drawer mobile selalu menampilkan label. */
    const effectiveCollapsed = collapsed && isLg;

    const navItems = [];

    navItems.push({
        href: route("dashboard"),
        label: "Dashboard",
        icon: IconLayoutDashboard,
        active: route().current("dashboard"),
    });

    if (hasAnyPermission(["permissions index"])) {
        navItems.push({
            href: route("permissions.index"),
            label: "Permissions",
            icon: IconLock,
            active: route().current("permissions*"),
        });
    }

    if (hasAnyPermission(["roles index"])) {
        navItems.push({
            href: route("roles.index"),
            label: "Roles",
            icon: IconShield,
            active: route().current("roles*"),
        });
    }

    if (hasAnyPermission(["users index"])) {
        navItems.push({
            href: route("users.index"),
            label: "Users",
            icon: IconUsers,
            active: route().current("users*"),
        });
    }

    const handleNavigate = () => {
        onCloseMobile?.();
    };

    return (
        <>
            <div
                className={clsx(
                    "fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-[2px] transition-opacity lg:hidden",
                    mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={onCloseMobile}
                aria-hidden="true"
            />

            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 flex h-screen max-w-[min(100vw-2rem,16rem)] flex-col border-r border-gray-200 bg-white shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)] transition-[transform,width] duration-200 ease-out lg:max-w-none lg:translate-x-0",
                    mobileOpen ? "translate-x-0" : "-translate-x-full",
                    "w-64",
                    collapsed && isLg ? "lg:w-[4.5rem]" : "lg:w-64"
                )}
            >
                <div
                    className={clsx(
                        "flex h-16 shrink-0 items-center border-b border-gray-100 px-4",
                        effectiveCollapsed && "justify-center px-2"
                    )}
                >
                    <Link
                        href={route("dashboard")}
                        className={clsx(
                            "flex min-w-0 items-center",
                            effectiveCollapsed && "justify-center"
                        )}
                        onClick={handleNavigate}
                    >
                        {!effectiveCollapsed ? (
                            <ApplicationLogo className="h-8 w-auto fill-current text-gray-800" />
                        ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
                                L
                            </span>
                        )}
                    </Link>
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="ms-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 lg:hidden"
                        aria-label="Tutup menu"
                    >
                        <IconX className="h-5 w-5" stroke={1.5} />
                    </button>
                </div>

                <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
                    <p
                        className={clsx(
                            "mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400",
                            effectiveCollapsed && "sr-only"
                        )}
                    >
                        Menu
                    </p>
                    <ul className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <NavItem
                                    {...item}
                                    collapsed={effectiveCollapsed}
                                    onNavigate={handleNavigate}
                                />
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="shrink-0 border-t border-gray-100 p-2">
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 lg:flex"
                        aria-label={
                            collapsed ? "Perluas sidebar" : "Ciutkan sidebar"
                        }
                    >
                        {collapsed ? (
                            <IconChevronRight className="h-5 w-5" stroke={1.5} />
                        ) : (
                            <>
                                <IconChevronLeft
                                    className="h-5 w-5"
                                    stroke={1.5}
                                />
                                <span className="text-xs">Ciutkan</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
