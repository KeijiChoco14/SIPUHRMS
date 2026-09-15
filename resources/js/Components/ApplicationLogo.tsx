import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/logo/logoswissbell.jpg"
            alt="Swiss-Belinn SKA Pekanbaru Logo"
        />
    );
}
