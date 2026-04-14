import clsx from "clsx";

const Card = ({ title, className, children }) => {
    return (
        <div
            className={clsx(
                "overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm",
                className
            )}
        >
            {title ? (
                <div className="border-b border-stone-100 px-5 py-4">
                    <h2 className="text-sm font-semibold tracking-tight text-stone-900 capitalize">
                        {title}
                    </h2>
                </div>
            ) : null}
            {children}
        </div>
    );
};

const Table = ({ children }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">{children}</table>
        </div>
    );
};

const Thead = ({ className, children }) => {
    return (
        <thead
            className={clsx(
                "border-b border-stone-100 bg-stone-50/90",
                className
            )}
        >
            {children}
        </thead>
    );
};

const Tbody = ({ className, children }) => {
    return (
        <tbody
            className={clsx(
                "divide-y divide-stone-100 bg-white [&_tr]:transition-colors [&_tr:hover]:bg-stone-50/70",
                className
            )}
        >
            {children}
        </tbody>
    );
};

const Td = ({ className, children }) => {
    return (
        <td
            className={clsx(
                "whitespace-nowrap px-5 py-3.5 align-middle text-stone-700",
                className
            )}
        >
            {children}
        </td>
    );
};

const Th = ({ className, children }) => {
    return (
        <th
            scope="col"
            className={clsx(
                "h-11 px-5 text-left align-middle text-xs font-medium uppercase tracking-wider text-stone-500",
                className
            )}
        >
            {children}
        </th>
    );
};

const Footer = ({ className, children }) => {
    return (
        <div
            className={clsx(
                "border-t border-stone-100 bg-stone-50/50 px-5 py-4",
                className
            )}
        >
            {children}
        </div>
    );
};

const Empty = ({ colSpan, message, children }) => {
    return (
        <tr>
            <td colSpan={colSpan}>
                <div className="flex h-48 items-center justify-center">
                    <div className="text-center text-stone-500">
                        {children}
                        <div className="mt-2 text-sm">{message}</div>
                    </div>
                </div>
            </td>
        </tr>
    );
};

Table.Card = Card;
Table.Thead = Thead;
Table.Tbody = Tbody;
Table.Td = Td;
Table.Th = Th;
Table.Footer = Footer;
Table.Empty = Empty;

export default Table;
