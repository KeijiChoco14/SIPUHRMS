import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-xl border border-transparent bg-[#E31B23] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c4141b] hover:shadow-md focus:bg-[#c4141b] focus:outline-none focus:ring-2 focus:ring-[#E31B23] focus:ring-offset-2 active:bg-[#a30f15] active:scale-[0.98] transition-all duration-150 ease-out ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
