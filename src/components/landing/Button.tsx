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
    "inline-flex items-center justify-center font-extrabold rounded-full transition-all duration-300 ease-out " +
    "hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] active:translate-y-0 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B14] focus-visible:ring-offset-2 " +
    "cursor-pointer text-center select-none";
  
  const variants = {
    primary: "bg-[#FF5B14] hover:bg-[#F04D00] text-white shadow-lg shadow-[#FF5B14]/25 hover:shadow-xl hover:shadow-[#FF5B14]/35",
    secondary: "bg-white hover:bg-neutral-50 text-[#1D1D1D] border border-[#ECECEC] shadow-sm hover:shadow-md",
    dark: "bg-[#1D1D1D] hover:bg-black text-white shadow-lg hover:shadow-xl",
    outline: "bg-transparent border border-[#ECECEC] hover:bg-white text-[#1D1D1D]"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-xs sm:text-sm tracking-tight",
    lg: "px-8 py-4 text-sm sm:text-base tracking-tight"
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
