import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  let badgeStyles = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ';

  switch (variant) {
    case 'success':
      // Soft green
      badgeStyles += 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      break;
    case 'warning':
      // Soft amber
      badgeStyles += 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      break;
    case 'error':
      // Soft red
      badgeStyles += 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      break;
    case 'info':
      // Soft blue
      badgeStyles += 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      break;
    default:
      // Soft slate
      badgeStyles += 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }

  return (
    <span className={`${badgeStyles} ${className}`} {...props}>
      {children}
    </span>
  );
};
