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
  const baseStyles = 
    "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 ease-out " +
    "hover:opacity-95 active:scale-95 cursor-pointer text-center select-none";
  
  const variants = {
    primary: "bg-[#FF5500] hover:bg-[#E04B00] text-white shadow-md shadow-[#FF5500]/20",
    secondary: "bg-[#EFEFE8] hover:bg-[#E5E5DC] text-[#1A1918] border border-black/5",
    dark: "bg-[#181716] hover:bg-black text-white shadow-lg",
    outline: "bg-[#EFEFE8] hover:bg-[#E5E5DC] text-[#1A1918] border border-black/5"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs font-extrabold uppercase tracking-wider",
    md: "px-6 py-3 text-xs sm:text-sm font-bold tracking-tight",
    lg: "px-8 py-3.5 text-sm sm:text-base font-bold tracking-tight"
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
