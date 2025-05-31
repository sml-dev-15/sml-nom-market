import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

const containerVariants = cva("w-full mx-auto max-w-[1440px]", {
  variants: {
    variant: {
      default: "px-4 md:px-8",
      centered: "px-4 md:px-8 flex flex-col items-center justify-center",
      padded: "px-6 py-8 md:px-12 md:py-10",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ContainerProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants> & {
    asChild?: boolean;
  };

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ asChild, className, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn(containerVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";
