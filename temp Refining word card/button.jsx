import React from 'react';

export const Button = ({ className, variant, size, onClick, children, ...props }) => {
  let baseStyle = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  let variantStyle = "";
  let sizeStyle = "";

  switch (variant) {
    case "default":
      variantStyle = "bg-primary text-primary-foreground hover:bg-primary/90";
      break;
    case "outline":
      variantStyle = "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
      break;
    case "ghost":
      variantStyle = "hover:bg-accent hover:text-accent-foreground";
      break;
    // Add more variants as needed
    default:
      variantStyle = "bg-primary text-primary-foreground hover:bg-primary/90";
  }

  switch (size) {
    case "sm":
      sizeStyle = "h-9 px-3";
      break;
    case "lg":
      sizeStyle = "h-11 px-8";
      break;
    case "icon":
      sizeStyle = "h-10 w-10";
      break;
    // Add more sizes as needed
    default:
      sizeStyle = "h-10 px-4 py-2";
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};


