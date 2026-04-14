import React from "react";
import clsx from "clsx";

function Card({ title, children, className }) {
    return (
        <div
            className={clsx(
                "overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm",
                className
            )}
        >
            {title ? (
                <>
                    <div className="border-b border-stone-100 px-6 py-4">
                        <div className="text-sm font-semibold tracking-tight text-stone-900 capitalize">
                            {title}
                        </div>
                    </div>
                    <div className="p-6">{children}</div>
                </>
            ) : (
                children
            )}
        </div>
    );
}

function CardHeader({ children, className }) {
    return (
        <div
            className={clsx(
                "border-b border-stone-100 bg-white px-6 py-5",
                className
            )}
        >
            {children}
        </div>
    );
}

function CardTitle({ children, className }) {
    return (
        <h3
            className={clsx(
                "text-lg font-semibold tracking-tight text-stone-900",
                className
            )}
        >
            {children}
        </h3>
    );
}

function CardDescription({ children, className }) {
    return (
        <p className={clsx("mt-1 text-sm text-stone-500", className)}>
            {children}
        </p>
    );
}

function CardContent({ children, className }) {
    return <div className={clsx("p-6", className)}>{children}</div>;
}

function CardFooter({ children, className }) {
    return (
        <div
            className={clsx(
                "border-t border-stone-100 bg-stone-50/40 px-6 py-4",
                className
            )}
        >
            {children}
        </div>
    );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
