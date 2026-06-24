import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function opensInNewTab(
    href: NonNullable<InertiaLinkProps['href']>,
    openInNewTab = false,
): boolean {
    if (openInNewTab) {
        return true;
    }

    const url = toUrl(href);

    return url.startsWith('http://') || url.startsWith('https://');
}
