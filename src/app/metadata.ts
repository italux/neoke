import type { Metadata } from "next";

const formatTitleFromPathname = (pathname: string): string => {
    if (!pathname || pathname === '/') return 'Home';

    const words = pathname.replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
        .split(/[-_]+/) // Split by one or more hyphens or underscores
        .filter(Boolean); // Remove empty strings

    const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'via'];

    return words.map((word, index) =>
        smallWords.includes(word.toLowerCase()) && index !== 0 ? word.toLowerCase() :
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
};

type MetadataOptions = {
    baseTitle?: string;
    baseDescription?: string;
    customTitles?: Record<string, string>;
};

export const generateMetadata = (
    pathname: string,
    description?: string,
    options: MetadataOptions = {}
): Metadata => {
    const {
        baseTitle = "NeoKÊ",
        baseDescription = "Join the best karaoke online queue and sing your heart out.",
        customTitles = {}
    } = options;

    const pageTitle = customTitles[pathname] ||
        (formatTitleFromPathname(pathname));

    return {
        title: `${baseTitle} | ${pageTitle}`,
        description: description || baseDescription,
    };
};