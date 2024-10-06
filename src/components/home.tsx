"use client";

import { Button } from "@/components/ui/button";
import { SiYoutube } from "react-icons/si";
import { useRouter } from "next/navigation";

export function HomePage() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="flex justify-between items-center p-4 bg-background border-b">
        <div className="flex items-center space-x-2">
          <img src="logo-512x512.png" alt="NeoKÊ Logo" className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-primary">NeoKÊ</h1>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground hidden sm:block">
            Ready to sing?
          </p>
          <Button onClick={() => router.push("/join")}>Join</Button>
        </div>
      </header> */}

      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="mb-8">
          <img src="logo-512x512.png" alt="NeoKÊ Logo" className=" mx-auto mb-4 h-16 w-16" />
          <h2 className="text-4xl font-extrabold mb-4">Welcome to NeoKÊ</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-md">
            Join the fun, manage your song list, and get ready for an
            unforgettable karaoke experience!
          </p>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <SiYoutube className="h-6 w-6 text-red-500" />
            <p className="text-lg font-medium">Powered by YouTube</p>
          </div>
          <p className="text-md text-muted-foreground max-w-lg mx-auto">
            NeoK&#234; is completely free to use! We leverage YouTube&apos;s vast library
            of karaoke videos to bring you an extensive selection of songs
            without any cost.
          </p>
        </div>
        <Button size="lg" onClick={() => router.push("/generate")}>
          Get Started
        </Button>
      </main>
    </div>
  );
}
