import { Link } from "@inertiajs/react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React from "react";
import clsx from "clsx";

const navBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-800";

const pageBtn =
    "min-w-[2.25rem] rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-50";

export default function Pagination({ links }) {
    return (
        <ul className="flex flex-wrap items-center justify-end gap-1">
            {links.map((item, i) => {
                if (item.url == null) return null;

                if (item.label.includes("Previous")) {
                    return (
                        <li key={i}>
                            <Link className={navBtn} href={item.url} aria-label="Halaman sebelumnya">
                                <IconChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                            </Link>
                        </li>
                    );
                }
                if (item.label.includes("Next")) {
                    return (
                        <li key={i}>
                            <Link className={navBtn} href={item.url} aria-label="Halaman berikutnya">
                                <IconChevronRight className="h-5 w-5" strokeWidth={1.5} />
                            </Link>
                        </li>
                    );
                }
                return (
                    <li key={i}>
                        <Link
                            className={clsx(
                                pageBtn,
                                item.active &&
                                    "border-stone-800 bg-stone-900 font-medium text-white hover:bg-stone-800"
                            )}
                            href={item.url}
                        >
                            <span dangerouslySetInnerHTML={{ __html: item.label }} />
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
