import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-slate-900/80 text-slate-200 border-white/10",
        destructive:
          "border-red-500/50 bg-red-950/60 text-red-200 dark:border-red-500 [&>svg]:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
        warning:
          "border-amber-500/50 bg-amber-950/60 text-amber-200 [&>svg]:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        success:
          "border-emerald-500/50 bg-emerald-950/60 text-emerald-200 [&>svg]:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
        info:
          "border-blue-500/50 bg-blue-950/60 text-blue-200 [&>svg]:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs [&_p]:leading-relaxed text-slate-300", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
