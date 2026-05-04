import React from "react";
import clsx from "clsx";

function Card({ title, children, className, darkTheme = true }) {
    return (
        <div
            className={clsx(
                darkTheme 
                    ? "overflow-hidden rounded-2xl border-[rgba(20,96,190,0.25)] bg-gradient-to-br from-[#154497] to-[#1460BE] shadow-[rgba(20,96,190,0.35)] transition-all duration-300 hover:border-[rgba(20,96,190,0.4)] hover:shadow-[rgba(20,96,190,0.5)] hover:-translate-y-1"
                    : "overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm",
                className
            )}
        >
            {title ? (
                <>
                    <div className={darkTheme ? "border-b border-[rgba(20,96,190,0.3)] bg-gradient-to-r from-[rgba(15,47,107,0.8)] to-[rgba(21,68,151,0.6)] px-6 py-4" : "border-b border-stone-100 px-6 py-4"}>
                        <div className={darkTheme ? "text-sm font-semibold tracking-tight text-white capitalize" : "text-sm font-semibold tracking-tight text-stone-900 capitalize"}>
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

function CardHeader({ children, className, darkTheme = true }) {
    return (
        <div
            className={clsx(
                darkTheme 
                    ? "border-b border-[rgba(20,96,190,0.3)] bg-gradient-to-r from-[rgba(15,47,107,0.8)] to-[rgba(21,68,151,0.6)] px-6 py-5"
                    : "border-b border-stone-100 bg-white px-6 py-5",
                className
            )}
        >
            {children}
        </div>
    );
}

function CardTitle({ children, className, darkTheme = true }) {
    return (
        <h3
            className={clsx(
                darkTheme 
                    ? "text-lg font-semibold tracking-tight text-white"
                    : "text-lg font-semibold tracking-tight text-stone-900",
                className
            )}
        >
            {children}
        </h3>
    );
}

function CardDescription({ children, className, darkTheme = true }) {
    return (
        <p className={clsx(
            darkTheme 
                ? "mt-1 text-sm text-[#B6D4FF]"
                : "mt-1 text-sm text-stone-500",
            className
        )}>
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
