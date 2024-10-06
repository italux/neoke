import type { Metadata } from "next";

const formatTitleFromPathname = (pathname: string): string => {
    return pathname
        .replace("/", "")
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export const generateMetadata = (pathname: string, description?: string): Metadata => {
    const baseTitle = "NeoKÊ";
    const baseDescription = "Join the best karaoke online queue and sing your heart out.";

    const pageTitle = pathname === "/" ? "Home" : formatTitleFromPathname(pathname);

    return {
        title: `${baseTitle} | ${pageTitle}`,
        description: description || baseDescription,
    };
};
