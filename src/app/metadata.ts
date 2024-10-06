// app/metadata.ts
import type { Metadata } from "next";

// Convert pathname to a readable title format (e.g., from '/about-us' to 'About Us')
const formatTitleFromPathname = (pathname: string): string => {
  return pathname
    .replace("/", "") // Remove leading slash
    .split("-") // Split by hyphen
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(" "); // Join words with space
};

// Function to generate dynamic metadata with templating
export const generateMetadata = (pathname: string, description?: string): Metadata => {
  const baseTitle = "NeoKÊ";
  const baseDescription = "Join the best karaoke online queue and sing your heart out.";

  const pageTitle = pathname === "/" ? "Home" : formatTitleFromPathname(pathname);

  return {
    title: `${baseTitle} | ${pageTitle}`, // Use formatted pathname
    description: description || baseDescription, // Default description if not provided
  };
};