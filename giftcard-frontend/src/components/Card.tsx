import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  highlight?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
  gradient = false,
  highlight = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl border transition-all duration-300 ${
        highlight
          ? "border-brand-300 shadow-lg shadow-brand-200/50"
          : "border-slate-200 shadow-sm"
      } ${
        hover
          ? "hover:border-brand-300 hover:shadow-lg hover:shadow-brand-200/50 hover:-translate-y-1 cursor-pointer"
          : ""
      } ${gradient ? "bg-gradient-to-br from-white to-slate-50" : ""} p-6 ${className}`}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-accent-50/50 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const PremiumCard: React.FC<CardProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden group p-8 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl hover:border-brand-300 hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-2 ${className}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-brand-500/10 to-accent-500/10" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Card;
