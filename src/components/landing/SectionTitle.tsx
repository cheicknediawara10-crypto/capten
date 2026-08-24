import React from "react";

interface SectionTitleProps {
  badge?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionTitle({
  badge,
  title,
  subtitle,
  align = "center",
  className = ""
}: SectionTitleProps) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`space-y-4 max-w-3xl ${alignment} ${className}`}>
      {badge && (
        <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#FF5500] bg-[#FF5500]/10 px-3.5 py-1.5 rounded-full border border-[#FF5500]/20">
          {badge}
        </span>
      )}
      <h2 className="font-extrabold text-3xl sm:text-5xl lg:text-[52px] text-[#1D1D1D] leading-[1.08] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-[#6E6E6E] font-medium leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
