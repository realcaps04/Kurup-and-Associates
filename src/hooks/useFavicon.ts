import { useEffect } from 'react';

/**
 * A custom hook to dynamically update the favicon.
 * @param href The URL of the favicon icon.
 */
export function useFavicon(href: string) {
    useEffect(() => {
        const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/svg+xml';
        link.rel = 'icon';
        link.href = href;

        document.getElementsByTagName('head')[0].appendChild(link);

        return () => {
            // Optional: Revert to default favicon on cleanup if needed
            // link.href = '/vite.svg'; 
        };
    }, [href]);
}
