"use client";

import { Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils/utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => {
    return (
      <div
        className={cn("grid gap-2", className)}
        role="radiogroup"
        ref={ref}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (
            React.isValidElement(child) &&
            child.props &&
            typeof child.props === "object" &&
            "value" in child.props
          ) {
            const childProps = child.props as { value: string };
            return React.cloneElement(
              child as React.ReactElement<RadioGroupItemProps>,
              {
                name,
                checked: childProps.value === value,
                onChange: () => onValueChange?.(childProps.value),
              },
            );
          }
          return child;
        })}
      </div>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, checked, onChange, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          type="radio"
          ref={ref}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
            className,
          )}
        >
          {checked && (
            <Circle className="h-2.5 w-2.5 fill-current text-current" />
          )}
        </div>
      </div>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
