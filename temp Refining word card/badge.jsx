import React from 'react';

export const Badge = ({ className, variant, children, ...props }) => {
  let baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  let variantStyle = "";

  switch (variant) {
    case "default":
      variantStyle = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";
      break;
    case "secondary":
      variantStyle = "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80";
      break;
    case "destructive":
      variantStyle = "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80";
      break;
    case "outline":
      variantStyle = "text-foreground";
      break;
    default:
      variantStyle = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";
  }

  return (
    <div className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};


