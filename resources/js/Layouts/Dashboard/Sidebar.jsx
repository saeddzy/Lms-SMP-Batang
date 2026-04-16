import { Link } from "@inertiajs/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import hasAnyPermission from "@/Utils/Permissions";
import { hasRole } from "@/Utils/Permissions";
import ApplicationLogo from "@/Components/ApplicationLogo";
import {
    IconChevronLeft,
    IconChevronRight,
    IconLayoutDashboard,
    IconLock,
    IconShield,
    IconUsers,
    IconX,
    IconSchool,
    IconBook,
    IconFileText,
    IconClipboardList,
    IconBrain,
    IconChartBar,
    IconTestPipe,
    IconHistory,
} from "@tabler/icons-react";

const iconProps = { stroke: 1.5, className: "h-5 w-5 shrink-0" };

function NavItem({ href, label, icon: Icon, active, collapsed, onNavigate }) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                    ? "bg-stone-100 text-stone-900 ring-1 ring-stone-200/80"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                collapsed && "justify-center px-2"
            )}
        >
            <span
                className={clsx(
                    "flex shrink-0",
                    active && "text-stone-900",
                    !active && "text-stone-500 group-hover:text-stone-700"
                )}
            >
                <Icon {...iconProps} />
            </span>
            {!collapsed && (
                <span className="truncate">{label}</span>
            )}
            {active && !collapsed && (
                <span className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-stone-800" />
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

    const effectiveCollapsed = collapsed && isLg;

    const navItems = [];

    const isStudent = hasRole("siswa");
    const isTeacher = hasRole("guru");
    const isAdmin = hasRole("admin");

    /** Menu siswa: berdasarkan peran, bukan permission generik yang bentrok dengan guru. */
    if (isStudent) {
        if (hasAnyPermission(["dashboard student"])) {
            navItems.push({
                href: route("student.dashboard"),
                label: "Dashboard Siswa",
                icon: IconLayoutDashboard,
                active: route().current("student.dashboard"),
            });
        }
        if (hasAnyPermission(["student classes"])) {
            navItems.push({
                href: route("student.classes"),
                label: "Kelas Anda",
                icon: IconSchool,
                active: route().current("student.classes"),
            });
        }
        if (hasAnyPermission(["tasks index"])) {
            navItems.push({
                href: route("student.tasks"),
                label: "Tugas Saya",
                icon: IconClipboardList,
                active: route().current("student.tasks"),
            });
        }
        if (hasAnyPermission(["quizzes index"])) {
            navItems.push({
                href: route("student.quizzes"),
                label: "Kuis Saya",
                icon: IconBrain,
                active: route().current("student.quizzes"),
            });
        }
        if (hasAnyPermission(["exams index"])) {
            navItems.push({
                href: route("student.exams"),
                label: "Ujian Saya",
                icon: IconTestPipe,
                active: route().current("student.exams"),
            });
        }
        if (hasAnyPermission(["grades index"])) {
            navItems.push({
                href: route("student.grades"),
                label: "Nilai Saya",
                icon: IconChartBar,
                active: route().current("student.grades"),
            });
        }
        navItems.push({
            href: route("student.enrollment-history"),
            label: "Riwayat kelas",
            icon: IconHistory,
            active: route().current("student.enrollment-history"),
        });
    }

    /** Guru & admin: dashboard mengajar / admin */
    if (!isStudent && isTeacher && hasAnyPermission(["dashboard teacher"])) {
        navItems.push({
            href: route("teacher.dashboard"),
            label: "Dashboard Guru",
            icon: IconLayoutDashboard,
            active: route().current("teacher.dashboard"),
        });
    }

    if (!isStudent && isAdmin && hasAnyPermission(["dashboard admin"])) {
        navItems.push({
            href: route("admin.dashboard"),
            label: "Dashboard Admin",
            icon: IconLayoutDashboard,
            active: route().current("admin.dashboard"),
        });
    }

    /** Kelola konten: tidak ditampilkan ke siswa meskipun punya permission index (sudah discope di backend). */
    if (!isStudent && hasAnyPermission(["classes index"])) {
        navItems.push({
            href: route("classes.index"),
            label: isAdmin ? "Kelola Kelas" : "Kelas",
            icon: IconSchool,
            active: route().current("classes*"),
        });
    }

    if (!isStudent && hasAnyPermission(["subjects index"])) {
        navItems.push({
            href: route("subjects.index"),
            label: "Mata Pelajaran",
            icon: IconBook,
            active: route().current("subjects*"),
        });
    }

    if (!isStudent && hasAnyPermission(["materials index"])) {
        navItems.push({
            href: route("materials.index"),
            label: "Materi Pembelajaran",
            icon: IconFileText,
            active: route().current("materials*"),
        });
    }

    if (!isStudent && hasAnyPermission(["tasks index"])) {
        navItems.push({
            href: route("tasks.index"),
            label: "Tugas",
            icon: IconClipboardList,
            active: route().current("tasks*"),
        });
    }

    if (!isStudent && hasAnyPermission(["quizzes index"])) {
        navItems.push({
            href: route("quizzes.index"),
            label: "Kuis",
            icon: IconBrain,
            active: route().current("quizzes*"),
        });
    }

    if (!isStudent && hasAnyPermission(["exams index"])) {
        navItems.push({
            href: route("exams.index"),
            label: "Ujian",
            icon: IconTestPipe,
            active: route().current("exams*"),
        });
    }

    if (!isStudent && hasAnyPermission(["grades index"])) {
        navItems.push({
            href: route("grades.index"),
            label: "Penilaian",
            icon: IconChartBar,
            active: route().current("grades*"),
        });
    }

    if (isAdmin && hasAnyPermission(["users index"])) {
        navItems.push({
            href: route("users.index"),
            label: "Manajemen User",
            icon: IconUsers,
            active: route().current("users*"),
        });
    }

    if (isAdmin && hasAnyPermission(["permissions index"])) {
        navItems.push({
            href: route("permissions.index"),
            label: "Permissions",
            icon: IconLock,
            active: route().current("permissions*"),
        });
    }

    if (isAdmin && hasAnyPermission(["roles index"])) {
        navItems.push({
            href: route("roles.index"),
            label: "Roles",
            icon: IconShield,
            active: route().current("roles*"),
        });
    }

    if (isAdmin && hasAnyPermission(["system analytics"])) {
        navItems.push({
            href: route("admin.reports"),
            label: "Laporan Sistem",
            icon: IconChartBar,
            active: route().current("admin.reports"),
        });
    }

    const handleNavigate = () => {
        onCloseMobile?.();
    };

    return (
        <>
            <div
                className={clsx(
                    "fixed inset-0 z-40 bg-stone-900/35 backdrop-blur-[2px] transition-opacity lg:hidden",
                    mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={onCloseMobile}
                aria-hidden="true"
            />

            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 flex h-screen max-w-[min(100vw-2rem,16rem)] flex-col border-r border-stone-200/90 bg-white shadow-[4px_0_24px_-12px_rgba(0,0,0,0.06)] transition-[transform,width] duration-200 ease-out lg:max-w-none lg:translate-x-0",
                    mobileOpen ? "translate-x-0" : "-translate-x-full",
                    "w-64",
                    collapsed && isLg ? "lg:w-[4.5rem]" : "lg:w-64"
                )}
            >
                <div
                    className={clsx(
                        "flex h-16 shrink-0 items-center border-b border-stone-100 px-4",
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
                            <ApplicationLogo className="h-8 w-auto fill-current text-stone-800" />
                        ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-xs font-bold text-white">
                                L
                            </span>
                        )}
                    </Link>
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="ms-auto inline-flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 lg:hidden"
                        aria-label="Tutup menu"
                    >
                        <IconX className="h-5 w-5" stroke={1.5} />
                    </button>
                </div>

                <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
                    <p
                        className={clsx(
                            "mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400",
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

                <div className="shrink-0 border-t border-stone-100 p-2">
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50/80 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 lg:flex"
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
