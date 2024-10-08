"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LogIn } from "lucide-react";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import { generateMetadata } from "./metadata";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

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

  type User = {
    displayName: string;
    email: string;
    photoURL: string;
  };

  const [user, setUser] = useState<User | null>(null);

  // State to track scroll direction
  const [scrollDirection, setScrollDirection] = useState("up");

  useEffect(() => {
    const generatedMetadata = generateMetadata(pathname);
    setMetadata({
      title: String(generatedMetadata.title) ?? "",
      description: generatedMetadata.description ?? "",
    });
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName || "",
          email: currentUser.email || "",
          photoURL: currentUser.photoURL || "",
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push(pathname);
    } catch (err) {
      console.error("Error signing out:", error);
      setError(
        "Oops! Something went wrong while signing out. Please try again."
      );
    }
  };

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      const direction = currentScrollY > lastScrollY ? "down" : "up";

      if (direction !== scrollDirection) {
        setScrollDirection(direction);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollDirection]);

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
        {/* Top navigation bar */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
            scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
          } bg-background border-b p-4`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo-512x512.png"
                alt="NeoKÊ Logo"
                width={32}
                height={32}
              />
              <Link href="/" className="text-primary">
                <h1 className="text-2xl font-bold text-primary">NeoKÊ</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden md:block">
                Ready to sing?
              </span>
              <Button onClick={() => router.push("/join")}>Join</Button>
              {user ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-11 w-11">
                        <AvatarImage
                          src={user.photoURL}
                          alt="User avatar"
                          style={{ borderRadius: "9999px" }}
                        />
                        <AvatarFallback>
                          {user.displayName
                            ? user.displayName
                                .split(" ")
                                .map((name) => name.charAt(0))
                                .join("")
                                .toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="w-56 bg-popover text-popover-foreground rounded-md p-1 shadow-md"
                      sideOffset={10}
                    >
                      <DropdownMenu.Separator className="h-px bg-border my-1" />
                      <DropdownMenu.Item
                        className="flex items-center p-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}