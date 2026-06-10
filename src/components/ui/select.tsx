"use client";
import * as React from "react";
import { Dropdown } from "./dropdown";
import { cn } from "@/lib/utils";

interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  id?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Wraps Dropdown with the same onChange API as a native <select>
 * so existing call sites (e => e.target.value) work without changes.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, value, onChange, disabled, className, size }, _ref) => {
    function handleChange(newValue: string) {
      if (!onChange) return;
      onChange({ target: { value: newValue } } as unknown as React.ChangeEvent<HTMLSelectElement>);
    }

    return (
      <Dropdown
        label={label}
        error={error}
        options={options}
        value={String(value ?? "")}
        onChange={handleChange}
        disabled={disabled}
        className={cn(className)}
        size={size}
      />
    );
  }
);
Select.displayName = "Select";
