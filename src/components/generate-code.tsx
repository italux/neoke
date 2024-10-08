"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase/firebaseConfig";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SVGProps, useState } from "react";

export function GenerateCode() {
  const router = useRouter();
  const [code, setCode] = useState(""); // Initially code is empty
  const [sessionName, setSessionName] = useState("");
  const [sessionNameError, setSessionNameError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false); // State for checkbox

  // Function to generate a 6-character session code
  function generateSessionCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing characters
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  async function generateCode() {
    // Validate session name
    if (!sessionName.trim()) {
      setSessionNameError("Session name is required.");
      return;
    } else {
      setSessionNameError("");
    }

    let newCode = "";
    let sessionExists = true;

    // Loop until a unique code is generated
    while (sessionExists) {
      newCode = generateSessionCode();
      const docRef = doc(db, "sessions", newCode);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        sessionExists = false;
      }
    }

    const expiresAt = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiration

    try {
      await setDoc(doc(db, "sessions", newCode), {
        sessionName: sessionName.trim(),
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        requiresAuth: requiresAuth, // Store the checkbox value in Firestore
      });

      setCode(newCode); // Set the generated code to state after successful Firestore write
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to store session in Firestore: ", err);
    }
  }

  function copyToClipboard() {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
      })
      .catch((err) => {
        console.error("Failed to copy code: ", err);
      });
  }

  function startSession() {
    if (code) {
      router.push(`/session/${code}`);
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="max-w-md w-full space-y-4 p-6 rounded-lg shadow-lg bg-card">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Generate Code</h1>
            <p className="text-muted-foreground">
              Share this code with participants to join your karaoke session.
            </p>
          </div>

          {/* Input for Session Name */}
          <Input
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Enter Session Name"
            required
          />
          {sessionNameError && (
            <div className="text-red-500 text-sm">{sessionNameError}</div>
          )}

          {/* Checkbox for requiring authentication */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requiresAuth"
              checked={requiresAuth}
              onChange={(e) => setRequiresAuth(e.target.checked)}
            />
            <label htmlFor="requiresAuth">Require authentication to join</label>
          </div>

          {/* Only show the generated code after the button is clicked */}
          {isSubmitted && (
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <Input
                  key={index}
                  type="text"
                  value={code[index] || ""}
                  readOnly
                  className="text-center text-2xl tracking-widest"
                />
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={isSubmitted ? startSession : generateCode}
              className="flex-grow"
              disabled={!sessionName}
            >
              {isSubmitted ? "Start session" : "Generate a session code"}
            </Button>
            {isSubmitted && (
              <Button onClick={copyToClipboard} className="flex-shrink-0">
                <CopyIcon />
              </Button>
            )}
          </div>

          {showAlert && (
            <Alert>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Code copied to clipboard!</AlertDescription>
            </Alert>
          )}

          <div className="text-center mt-4">
            <Link href="/sessions" className="text-blue-500 hover:underline">
              Active sessions
            </Link>
          </div>
        </div>
      </div>

      <Button
        className="fixed bottom-5 left-5 rounded-lg p-4 bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover"
        onClick={() => router.push("/")}
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </Button>
    </>
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

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}
