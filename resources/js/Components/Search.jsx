import { router, useForm } from "@inertiajs/react";
import { IconSearch } from "@tabler/icons-react";
import React from "react";

const inputClass =
    "block w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-4 pr-11 text-sm text-stone-800 placeholder:text-stone-400 shadow-sm transition-colors focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400";

/**
 * Server search: pass `url` (and optional `filter` for initial query).
 * Client filter: pass `value` and `onSearch` (onChange handler receiving string).
 */
export default function Search({
    url,
    placeholder,
    filter,
    value,
    onSearch,
    className = "",
}) {
    if (onSearch != null && value != null) {
        return (
            <div className={`relative ${className}`}>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onSearch(e.target.value)}
                    className={inputClass}
                    placeholder={placeholder}
                    aria-label={placeholder ?? "Cari"}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400">
                    <IconSearch className="h-4 w-4" strokeWidth={1.5} />
                </div>
            </div>
        );
    }

    const { data, setData } = useForm({
        search: filter?.search ?? "",
    });

    const performSearch = (keyword) => {
        if (!url) {
            return;
        }
        const query = { search: keyword ?? "" };
        if (filter && typeof filter === "object") {
            Object.entries(filter).forEach(([k, v]) => {
                if (k === "search") {
                    return;
                }
                if (v !== null && v !== undefined && String(v) !== "") {
                    query[k] = v;
                }
            });
        }
        router.get(url, query, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchData = (e) => {
        e.preventDefault();
        performSearch(data.search ?? "");
    };

    return (
        <form onSubmit={handleSearchData} className={className}>
            <div className="relative">
                <input
                    type="text"
                    value={data.search}
                    onChange={(e) => setData("search", e.target.value)}
                    className={inputClass}
                    placeholder={placeholder}
                    aria-label={placeholder ?? "Cari"}
                />
                <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition-colors hover:text-stone-600"
                    aria-label="Cari"
                >
                    <IconSearch className="h-4 w-4" strokeWidth={1.5} />
                </button>
            </div>
        </form>
    );
}
