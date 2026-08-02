import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className = "",
  fullWidth = false
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-extrabold rounded-full transition-all duration-200 active:scale-95 cursor-pointer text-center";
  
  const variants = {
    primary: "bg-[#FF5B14] hover:bg-[#F04D00] text-white shadow-lg shadow-[#FF5B14]/25",
    secondary: "bg-white hover:bg-neutral-100 text-[#1D1D1D] border border-[#ECECEC]",
    dark: "bg-[#1D1D1D] hover:bg-black text-white shadow-lg",
    outline: "bg-transparent border border-[#ECECEC] hover:bg-white text-[#1D1D1D]"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-xs sm:text-sm",
    lg: "px-8 py-4 text-sm sm:text-base"
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const combined = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combined}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combined}>
      {children}
    </button>
  );
}
