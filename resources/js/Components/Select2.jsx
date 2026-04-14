import React from "react";
import ReactSelect from "react-select";

const minimalStyles = {
    control: (base, state) => ({
        ...base,
        borderRadius: "0.75rem",
        borderColor: state.isFocused ? "#a8a29e" : "#e7e5e4",
        boxShadow: state.isFocused ? "0 0 0 1px #a8a29e" : "none",
        minHeight: "42px",
        backgroundColor: "#fff",
        "&:hover": { borderColor: "#d6d3d1" },
    }),
    menu: (base) => ({
        ...base,
        borderRadius: "0.75rem",
        border: "1px solid #e7e5e4",
        boxShadow:
            "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06)",
        overflow: "hidden",
    }),
    option: (base, state) => ({
        ...base,
        fontSize: "0.875rem",
        backgroundColor: state.isSelected
            ? "#1c1917"
            : state.isFocused
              ? "#f5f5f4"
              : "#fff",
        color: state.isSelected ? "#fff" : "#44403c",
    }),
    placeholder: (base) => ({ ...base, color: "#a8a29e", fontSize: "0.875rem" }),
    singleValue: (base) => ({ ...base, color: "#44403c", fontSize: "0.875rem" }),
    multiValue: (base) => ({
        ...base,
        borderRadius: "0.5rem",
        backgroundColor: "#f5f5f4",
    }),
    multiValueLabel: (base) => ({ ...base, color: "#44403c", fontSize: "0.8125rem" }),
    multiValueRemove: (base) => ({
        ...base,
        color: "#78716c",
        ":hover": { backgroundColor: "#e7e5e4", color: "#1c1917" },
    }),
    input: (base) => ({ ...base, fontSize: "0.875rem" }),
    indicatorsContainer: (base) => ({ ...base }),
};

export default function Select2({
    options = [],
    value = null,
    defaultValue = null,
    onChange,
    placeholder = "Select...",
    isMulti = false,
    name = "",
}) {
    return (
        <ReactSelect
            isMulti={isMulti}
            name={name}
            options={options}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            placeholder={placeholder}
            classNamePrefix="select"
            styles={minimalStyles}
        />
    );
}
