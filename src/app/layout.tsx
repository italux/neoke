"use client";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import { generateMetadata } from "./metadata";
import { useEffect, useState } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const generatedMetadata = generateMetadata(pathname);
    setMetadata({
      title: String(generatedMetadata.title) ?? "",
      description: generatedMetadata.description ?? "",
    });
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        <title>{String(metadata.title)}</title>
        <meta name="description" content={metadata.description ?? ""} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <meta
        name="google-site-verification"
        content="J3VVJwCpREAwdmI9bRsG04lZ65q7Fon7v4ULHhGSOCY"
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="flex justify-between items-center p-4 bg-background border-b">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo-512x512.png"
              alt="NeoKÊ Logo"
              width={24}
              height={24}
            />
            <Link href="/" className="text-primary">
              <h1 className="text-2xl font-bold text-primary">NeoKÊ</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Ready to sing?
            </p>
            <Button onClick={() => router.push("/join")}>Join</Button>
          </div>
        </header>
        {children}
        <Footer />
      </body>
    </html>
  );
}
