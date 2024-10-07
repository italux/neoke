"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";

interface LogoutProps {
    redirectUrl?: string;
}

export function Logout({ redirectUrl = "/login" }: LogoutProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleLogout = async () => {
            try {
                await signOut(auth);
                router.push(redirectUrl);
            } catch (error) {
                console.error("Error logging out: ", error);
                setError("An error occurred while logging out. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        handleLogout();
    }, [router, redirectUrl]);

    return (
        <div className="flex justify-center items-center h-screen">
            {isLoading ? (
                <div className="flex items-center space-x-2">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <span>Logging out...</span>
                </div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : null}
        </div>
    );
}