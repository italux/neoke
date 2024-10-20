"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where
} from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SVGProps, useCallback, useEffect, useState } from "react";

export function SessionList() {
  const [sessions, setSessions] = useState<
    { id: string; sessionName: string; queueCount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function fetchSessions() {
    try {
      const sessionsCollection = collection(db, "sessions");
      const now = Timestamp.now();
      const sessionsQuery = query(
        sessionsCollection,
        where("expiresAt", ">", now),
        orderBy("createdAt", "desc")
      );
      const sessionSnapshot = await getDocs(sessionsQuery);

      const sessionList = sessionSnapshot.docs.map((doc) => {
        const sessionData = doc.data();
        const sessionName = sessionData.sessionName || "Unnamed Session";
        const queueCount = sessionData.queueCount || "Some";

        return {
          id: doc.id,
          sessionName,
          queueCount,
        };
      });

      setSessions(sessionList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching sessions: ", err);
      setError("Failed to load sessions. Please try again later.");
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        fetchSessions();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGenerateNewCode = useCallback(() => {
    router.push("/generate");
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Loading sessions...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Card className="w-full max-w-lg mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Ongoing Karaoke Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-center text-gray-500">
                No active sessions at the moment.
              </p>
            ) : (
              <ul className="space-y-2">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <div
                      className="flex justify-between items-center p-2 bg-secondary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-pointer"
                      onClick={() => router.push(`/session/${session.id}`)}
                    >
                      <div>
                        <span className="font-medium">
                          {session.sessionName}
                        </span>
                        <div className="text-sm text-muted-foreground">
                          {session.queueCount}{" "}
                          {session.queueCount === 1 ? "person" : "people"} in
                          queue
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {session.id}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="text-center mt-4 flex-grow">
              <Button className="flex-grow" onClick={handleGenerateNewCode}>
                Create a new session code
              </Button>
            </div>
          </CardContent>
        </Card>
        <Button
          className="fixed bottom-5 left-5 rounded-lg p-4 bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover"
          onClick={() => router.push("/")}
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </Button>
      </div>
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
