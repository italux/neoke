"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";

export function Logout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push("/login"); // Redirect to the login page after logout
      } catch (error) {
        console.error("Error logging out: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <span>Logging out...</span>
        </div>
      ) : null}
    </div>
  );
}
