import { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    children: ReactNode;
    className?: string;
}

export default function Badge({
    variant = 'neutral',
    size = 'sm',
    dot = false,
    children,
    className = '',
}: BadgeProps) {
    const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
        brand: {
            badge: 'bg-red-50 text-[#E31B23] border border-red-200/70',
            dot: 'bg-[#E31B23]',
        },
        success: {
            badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
            dot: 'bg-emerald-500',
        },
        warning: {
            badge: 'bg-amber-50 text-amber-700 border border-amber-200/70',
            dot: 'bg-amber-500',
        },
        danger: {
            badge: 'bg-rose-50 text-rose-700 border border-rose-200/70',
            dot: 'bg-rose-500',
        },
        info: {
            badge: 'bg-sky-50 text-sky-700 border border-sky-200/70',
            dot: 'bg-sky-500',
        },
        neutral: {
            badge: 'bg-slate-100 text-slate-700 border border-slate-200',
            dot: 'bg-slate-400',
        },
    };

    const sizeStyles: Record<BadgeSize, string> = {
        sm: 'text-xs px-2.5 py-0.5',
        md: 'text-sm px-3 py-1',
    };

    const selectedVariant = variantStyles[variant] || variantStyles.neutral;
    const selectedSize = sizeStyles[size] || sizeStyles.sm;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ${selectedVariant.badge} ${selectedSize} ${className}`}
        >
            {dot && (
                <span
                    className={`h-1.5 w-1.5 rounded-full ${selectedVariant.dot}`}
                    aria-hidden="true"
                />
            )}
            {children}
        </span>
    );
}
