import clsx from "clsx";

export default function Content({ children, className }) {
    return (
        <main
            className={clsx(
                "min-h-0 flex-1 overflow-y-auto bg-[#f8f9fb]",
                className
            )}
        >
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </div>
        </main>
    );
}
