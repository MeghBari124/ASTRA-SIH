import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow hover:bg-blue-500 active:bg-blue-700",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700",
        outline:
          "border border-white/15 bg-transparent shadow-sm hover:bg-white/10 hover:text-white",
        secondary:
          "bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700",
        ghost: "hover:bg-white/10 hover:text-white",
        link: "text-blue-400 underline-offset-4 hover:underline",
        cyber:
          "border border-blue-500/40 bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
        emergency:
          "bg-gradient-to-r from-red-600 to-rose-700 text-white font-semibold hover:from-red-500 hover:to-rose-600 shadow-[0_0_20px_rgba(239,68,68,0.35)] animate-pulse",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
