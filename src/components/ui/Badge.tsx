import React from "react";

interface BadgeProps {
  variant?: "primary" | "secondary" | "accent" | "sand" | "outline";
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "sand",
  className = "",
  children,
}) => {
  const variantStyles = {
    primary: "bg-[#0C5A70]/10 text-[#0C5A70] border border-[#0C5A70]/20",
    secondary: "bg-[#2B5829]/10 text-[#2B5829] border border-[#2B5829]/20",
    accent: "bg-[#E06D53]/15 text-[#C8573D] border border-[#E06D53]/25",
    sand: "bg-[#E8E2D2]/60 text-[#17202A] border border-[#E8E2D2]",
    outline: "border border-[#E8E2D2] text-[#5B6770] bg-white",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
export default Badge;
