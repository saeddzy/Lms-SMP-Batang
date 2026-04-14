import React from "react";
import clsx from "clsx";

const fieldClass =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 shadow-sm transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400";

function Input({ type = "text", className = "", ...props }) {
    return (
        <input
            type={type}
            className={clsx(fieldClass, className)}
            {...props}
        />
    );
}

function Label({ htmlFor, value, className = "" }) {
    return (
        <label
            htmlFor={htmlFor}
            className={clsx("text-sm font-medium text-stone-600", className)}
        >
            {value}
        </label>
    );
}

function Error({ message, className = "" }) {
    if (!message) return null;

    return (
        <p className={clsx("text-xs text-red-600", className)}>{message}</p>
    );
}

function Text(props) {
    return <Input type="text" {...props} />;
}

function DateInput(props) {
    return <Input type="date" {...props} />;
}

function TimeInput(props) {
    return <Input type="time" {...props} />;
}

/** Gabungan tanggal + jam (zona waktu lokal browser). */
function DateTimeLocalInput(props) {
    return <Input type="datetime-local" step={60} {...props} />;
}

function NumberInput(props) {
    return <Input type="number" {...props} />;
}

Input.Label = Label;
Input.Error = Error;
Input.Text = Text;
Input.Date = DateInput;
Input.Time = TimeInput;
Input.DateTimeLocal = DateTimeLocalInput;
Input.Number = NumberInput;

export default Input;
