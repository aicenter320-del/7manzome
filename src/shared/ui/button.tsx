import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl bg-primary text-primary-foreground shadow-glow hover:bg-primary/90",
        gold: "rounded-2xl bg-gold text-accent-foreground shadow-glow hover:bg-gold-deep hover:text-primary-foreground",
        secondary:
          "glass rounded-2xl text-secondary-foreground hover:bg-gold-soft/40",
        outline:
          "glass rounded-2xl text-foreground hover:bg-gold-soft/30",
        ghost: "rounded-2xl hover:bg-gold-soft/40 hover:text-foreground",
        destructive:
          "rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "rounded-2xl bg-success text-success-foreground hover:bg-success/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-11 px-5",
        lg: "h-13 px-8 text-base",
        icon: "size-12 rounded-full p-0",
        "icon-sm": "size-9 rounded-full p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const isIcon = size === "icon" || size === "icon-sm";
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant: isIcon && !variant ? "outline" : variant, size }),
        isIcon && "glass",
        className,
      )}
      {...props}
    />
  );
}

export { buttonVariants };
