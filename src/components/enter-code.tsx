"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, SVGProps } from "react";

export function EnterCode() {
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle input change in the session code inputs
  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  // Handle paste event for the session code
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = event.clipboardData.getData("text").toUpperCase();
    const regex = /^[A-Z2-9]{6}$/; // Matches 6 characters excluding ambiguous ones
    if (regex.test(paste)) {
      paste.split("").forEach((char, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index]!.value = char;
        }
      });
      inputRefs.current[inputRefs.current.length - 1]?.focus();
    }
    event.preventDefault();
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(""); // Reset error message

    // Get the entered code
    const code = inputRefs.current.map((input) => input?.value).join("");

    // Validate code format
    const codeRegex = /^[A-Z2-9]{6}$/;
    if (!codeRegex.test(code)) {
      setErrorMessage(
        "Invalid code format. Please enter a valid 6-character code."
      );
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
        setErrorMessage(
          "Session not found. Please check the code and try again."
        );
      }
    } catch (error) {
      console.error("Error checking session: ", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <><div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-md w-full space-y-4 p-6 rounded-lg shadow-lg bg-card">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Enter Session Code</h1>
          <p className="text-muted-foreground">
            Please enter the 6-character session code to join.
          </p>
        </div>

        {/* Error message for invalid session code */}
        {errorMessage && (
          <Alert variant="default">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Session code input form */}
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
                ref={(el: HTMLInputElement | null) => {
                  inputRefs.current[index] = el;
                } }
                onChange={(event) => handleInputChange(index, event)}
                onPaste={index === 0 ? handlePaste : undefined}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" &&
                    !event.currentTarget.value &&
                    index > 0) {
                    inputRefs.current[index - 1]?.focus();
                  }
                } } />
            ))}
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link href="/sessions" className="text-blue-500 hover:underline">
            I don&apos;t have a code
          </Link>
        </div>
      </div>
    </div><Button
      className="fixed bottom-5 left-5 rounded-lg p-4 bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover"
      onClick={() => router.push("/")}
    >
        <ArrowLeftIcon className="w-6 h-6" />
      </Button></>
  );
}

function ArrowLeftIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}
