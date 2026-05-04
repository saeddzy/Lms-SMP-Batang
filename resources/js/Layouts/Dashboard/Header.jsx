import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import {
    IconBell,
    IconChevronDown,
    IconMenu2,
} from "@tabler/icons-react";
import { userCompactLogin } from "@/Utils/userDisplay";

export default function Header({
    title,
    onOpenMobileSidebar,
    showLogo = true,
}) {
    const titleNode =
        title == null ? null : typeof title === "string" ? (
            <h1 className="line-clamp-1 text-base font-semibold leading-tight tracking-tight text-stone-900 sm:text-lg md:text-xl">
                {title}
            </h1>
        ) : (
            title
        );
    const user = usePage().props.auth.user;

    return (
        <header className="sticky top-0 z-40 flex h-14 max-h-14 shrink-0 items-center justify-between gap-2 border-b border-stone-200/80 bg-white/90 px-3 backdrop-blur-md sm:h-16 sm:max-h-16 sm:gap-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={onOpenMobileSidebar}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-900 lg:hidden"
                    aria-label="Buka menu"
                >
                    <IconMenu2 className="h-5 w-5" stroke={1.5} />
                </button>

                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
                    {showLogo && (
                        <Link
                            href={route("dashboard")}
                            className="hidden shrink-0 sm:block"
                        >
                            <ApplicationLogo className="h-7 w-auto fill-current text-stone-800 sm:h-8" />
                        </Link>
                    )}
                    <div className="min-w-0 flex-1 overflow-hidden">{titleNode}</div>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                    aria-label="Notifikasi"
                >
                    <IconBell className="h-5 w-5" stroke={1.5} />
                </button>

                <Dropdown>
                    <Dropdown.Trigger>
                        <button
                            type="button"
                            className="flex max-w-[12rem] items-center gap-2 rounded-xl border border-stone-200 bg-white py-1.5 pl-1.5 pr-2 text-left text-sm transition hover:border-stone-300 hover:bg-stone-50"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-xs font-semibold uppercase text-white">
                                {user.name?.charAt(0) ?? "?"}
                            </span>
                            <span className="hidden min-w-0 flex-1 truncate font-medium text-stone-700 md:block">
                                {user.name}
                            </span>
                            <IconChevronDown
                                className="hidden h-4 w-4 shrink-0 text-stone-400 md:block"
                                stroke={1.5}
                            />
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content align="right" width="48">
                        <div className="border-b border-stone-100 px-4 py-3">
                            <p className="truncate text-sm font-medium text-stone-900">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-stone-500">
                                {userCompactLogin(user) || "—"}
                            </p>
                        </div>
                        <Dropdown.Link href={route("profile.edit")}>
                            Profile
                        </Dropdown.Link>
                        <Dropdown.Link
                            href={route("logout")}
                            method="post"
                            as="button"
                        >
                            Log Out
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </header>
    );
}
