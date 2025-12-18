import React from "react";
import { cn } from "@/lib/utils/cn";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-muted-foreground", className)}
      {...rest}
    />
  );
});

Label.displayName = "Label";
