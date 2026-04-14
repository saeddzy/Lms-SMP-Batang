import { useForm } from "@inertiajs/react";
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

    const { data, setData, get } = useForm({
        search: filter?.search ?? "",
    });

    const handleSearchData = (e) => {
        e.preventDefault();
        if (!url) {
            return;
        }
        const q = encodeURIComponent(data.search ?? "");
        get(`${url}?search=${q}`);
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400">
                    <IconSearch className="h-4 w-4" strokeWidth={1.5} />
                </div>
            </div>
        </form>
    );
}
