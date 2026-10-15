import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
  href?: string;
  isExternal?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  href,
  isExternal,
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-center";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs font-semibold gap-1.5 min-h-[36px]",
    md: "px-5 py-2.5 text-sm font-semibold gap-2 min-h-[44px]",
    lg: "px-6 py-3.5 text-base font-bold gap-2.5 min-h-[50px]",
  };

  const variantStyles = {
    primary:
      "bg-[#0C5A70] hover:bg-[#083B4A] text-white shadow-sm hover:shadow-md",
    secondary:
      "bg-[#2B5829] hover:bg-[#1E3F1D] text-white shadow-sm hover:shadow-md",
    accent:
      "bg-[#E06D53] hover:bg-[#C8573D] text-white shadow-md hover:shadow-lg",
    outline:
      "border-2 border-[#0C5A70] text-[#0C5A70] hover:bg-[#0C5A70] hover:text-white bg-transparent",
    ghost:
      "text-[#17202A] hover:bg-[#E8E2D2]/40 bg-transparent",
    whatsapp:
      "bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold shadow-md hover:shadow-lg",
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    const anchorProps = { ...props };
    delete (anchorProps as { type?: unknown }).type;
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClasses}
          {...(anchorProps as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={combinedClasses}
        {...(anchorProps as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};
export default Button;
