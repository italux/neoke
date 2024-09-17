"use client";

import { useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link'; // Import Link from next/link

export function EnterCode() {
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase();
    event.target.value = value;

    if (value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Move to previous input if backspace is pressed and input is empty
    if (value.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = event.clipboardData.getData('text').toUpperCase();
    const regex = /^[A-Z2-9]{6}$/; // Matches 6 characters excluding ambiguous ones
    if (regex.test(paste)) {
      paste.split('').forEach((char, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index]!.value = char;
        }
      });
      inputRefs.current[inputRefs.current.length - 1]?.focus();
    }
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(""); // Reset error message

    // Get the entered code
    const code = inputRefs.current.map(input => input?.value).join('');

    // Validate code format
    const codeRegex = /^[A-Z2-9]{6}$/;
    if (!codeRegex.test(code)) {
      setErrorMessage("Invalid code format. Please enter a valid 6-character code.");
      return;
    }

    // Check if the session exists in Firestore
    try {
      const docRef = doc(db, "sessions", code);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Redirect to the session page
        router.push(`/session/${code}`);
      } else {
        setErrorMessage("Session not found. Please check the code and try again.");
      }
    } catch (error) {
      console.error("Error checking session: ", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-md w-full space-y-4 p-6 rounded-lg shadow-lg bg-card">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Enter Session Code</h1>
          <p className="text-muted-foreground">
            Please enter the 6-character session code to join.
          </p>
        </div>
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Input
                key={index}
                type="text"
                maxLength={1}
                pattern="[A-Z2-9]"
                placeholder=""
                className="w-12 h-12 text-center text-2xl tracking-widest"
                required
                ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                onChange={(event) => handleInputChange(index, event)}
                onPaste={index === 0 ? handlePaste : undefined}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !event.currentTarget.value && index > 0) {
                    inputRefs.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
        {/* Added the new link here */}
        <div className="text-center mt-4">
          <Link href="/generate" className="text-blue-500 hover:underline">
            I don&apos;t have a code
          </Link>
        </div>
      </div>
    </div>
  );
}