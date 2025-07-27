import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "filled" | "outlined";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      variant = "default",
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      filled:
        "bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
      outlined:
        "border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LeftIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              "block w-full rounded-lg shadow-sm transition-colors duration-200",
              variantStyles[variant],
              LeftIcon && "pl-10",
              RightIcon && "pr-10",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />

          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <RightIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn("text-sm", error ? "text-red-600" : "text-gray-500")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "filled" | "outlined";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, variant = "default", className, ...props },
    ref
  ) => {
    const variantStyles = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      filled:
        "bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
      outlined:
        "border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          className={cn(
            "block w-full rounded-lg shadow-sm transition-colors duration-200 resize-vertical",
            variantStyles[variant],
            error && "border-red-300 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />

        {(error || helperText) && (
          <p
            className={cn("text-sm", error ? "text-red-600" : "text-gray-500")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  variant?: "default" | "filled" | "outlined";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      variant = "default",
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      filled:
        "bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
      outlined:
        "border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <select
          ref={ref}
          className={cn(
            "block w-full rounded-lg shadow-sm transition-colors duration-200",
            variantStyles[variant],
            error && "border-red-300 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {(error || helperText) && (
          <p
            className={cn("text-sm", error ? "text-red-600" : "text-gray-500")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
              error && "border-red-300 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-gray-700">{label}</label>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn("text-sm", error ? "text-red-600" : "text-gray-500")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

interface RadioGroupProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  name: string;
}

export function RadioGroup({
  label,
  error,
  helperText,
  options,
  value,
  onChange,
  name,
}: RadioGroupProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className={cn(
                "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300",
                error && "border-red-300 focus:ring-red-500"
              )}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className={cn(
                "text-sm text-gray-700",
                option.disabled && "text-gray-400 cursor-not-allowed"
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {(error || helperText) && (
        <p className={cn("text-sm", error ? "text-red-600" : "text-gray-500")}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
