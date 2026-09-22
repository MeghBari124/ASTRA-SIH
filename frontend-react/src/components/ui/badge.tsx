import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-600 text-white shadow hover:bg-blue-700",
        secondary:
          "border-transparent bg-slate-800 text-slate-300 hover:bg-slate-700",
        destructive:
          "border-red-500/40 bg-red-950/60 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
        outline: "text-slate-300 border-white/15",
        normal:
          "border-emerald-500/30 bg-emerald-950/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
        watch:
          "border-blue-500/30 bg-blue-950/50 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.15)]",
        concerning:
          "border-amber-500/40 bg-amber-950/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        escalating:
          "border-rose-500/50 bg-rose-950/70 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse",
        critical:
          "border-red-500 bg-red-900/80 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
