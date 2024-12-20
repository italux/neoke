"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/firebase/firebaseConfig";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import debounce from "lodash.debounce";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SVGProps, useCallback, useEffect, useState } from "react";

const youtubeUrlRegex =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})(?:\S+)?$/;

interface Video {
  name: string;
  song: string;
  videoUrl: string;
}

interface SearchResult {
  song: string;
  videoUrl: string;
}

export function Karaoke({ code }: { code: string }) {
  const router = useRouter();
  const [queue, setQueue] = useState<
    Array<{
      [x: string]: any;
      id: string;
    }>
  >([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newName, setNewName] = useState("");
  const [newSong, setNewSong] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newNameError, setNewNameError] = useState("");
  const [newVideoUrlError, setNewVideoUrlError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track user authentication status

  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const DEBOUNCE_TIME_MS = 300;
  const MIN_QUERY_LENGTH = 5;

  const fetchYouTubeResults = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < MIN_QUERY_LENGTH || !YOUTUBE_API_KEY) return;

      const queryPrefix = "Karaoke +";

      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/search`,
          {
            params: {
              part: "snippet",
              q: queryPrefix + query,
              type: "video",
              maxResults: 3,
              key: YOUTUBE_API_KEY,
            },
          }
        );

        const videoIds = response.data.items
          .map((item: any) => item.id.videoId)
          .join(",");

        const videoDetailsResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/videos`,
          {
            params: {
              part: "status",
              id: videoIds,
              key: YOUTUBE_API_KEY,
            },
          }
        );

        const embeddableVideos = videoDetailsResponse.data.items.filter(
          (item: any) => item.status.embeddable
        );

        const results = response.data.items
          .filter((item: any) =>
            embeddableVideos.find((video: any) => video.id === item.id.videoId)
          )
          .map((item: any) => ({
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            song: item.snippet.title,
          }));

        setSearchResults(results);
      } catch (error) {
        console.error("Error fetching YouTube results:", error);
      }
    }, DEBOUNCE_TIME_MS),
    []
  );

  useEffect(() => {
    const sessionRef = doc(db, "sessions", code);

    // Check the session and whether it requires authentication
    getDoc(sessionRef)
      .then((docSnap) => {
        if (!docSnap.exists()) {
          router.push("/enter-code");
        } else {
          const sessionData = docSnap.data();
          if (sessionData?.requiresAuth) {
            // If session requires authentication, check user's auth state
            onAuthStateChanged(auth, (user) => {
              if (user) {
                setIsAuthenticated(true); // User is logged in
              } else {
                router.push("/login"); // Redirect to login if not authenticated
              }
            });
          } else {
            setIsAuthenticated(true); // No authentication required
          }
        }
      })
      .catch((error) => {
        console.error("Error checking session: ", error);
        router.push("/enter-code");
      });
  }, [code, router]);

  useEffect(() => {
    if (!code || !isAuthenticated) return;

    console.log("Setting up Firestore listeners for session:", code);

    const queueRef = collection(db, "sessions", code, "queue");
    const q = query(queueRef, orderBy("addedAt"));

    const unsubscribeQueue = onSnapshot(
      q,
      (snapshot) => {
        const queueData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Received queue data:", queueData);
        setQueue(queueData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching queue data:", error);
      }
    );

    const currentVideoRef = doc(
      db,
      "sessions",
      code,
      "currentVideo",
      "current"
    );
    const unsubscribeCurrentVideo = onSnapshot(
      currentVideoRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Received current video data:", data);
          setCurrentVideo(data as Video);
        } else {
          console.log("No current video data found");
          setCurrentVideo(null);
        }
      },
      (error) => {
        console.error("Error fetching current video data:", error);
      }
    );

    return () => {
      console.log("Cleaning up Firestore listeners for session:", code);
      unsubscribeQueue();
      unsubscribeCurrentVideo();
    };
  }, [code, isAuthenticated]);

  const handleAddToQueue = async () => {
    if (!newName) {
      setNewNameError("Name is required");
      return;
    } else {
      setNewNameError("");
    }
    if (!newVideoUrl || !youtubeUrlRegex.test(newVideoUrl)) {
      setNewVideoUrlError("Invalid YouTube URL format");
      return;
    } else {
      setNewVideoUrlError("");
    }
    if (newName && newVideoUrl) {
      const newQueueItem = {
        name: newName,
        song: newSong || "", // Ensure it's a string
        videoUrl: newVideoUrl,
        addedAt: serverTimestamp(), // Add timestamp here
      };
      const sessionRef = doc(db, "sessions", code);
      console.log("Attempting to add to Firestore:", newQueueItem);
      try {
        await addDoc(collection(db, "sessions", code, "queue"), newQueueItem);
        await updateDoc(sessionRef, {
          queueCount: increment(1),
        });
        console.log("Successfully added to Firestore");
        setNewName("");
        setNewSong("");
        setNewVideoUrl("");
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const handleDeleteFromQueue = async (id: string) => {
    const sessionRef = doc(db, "sessions", code);
    try {
      await deleteDoc(doc(db, "sessions", code, "queue", id));
      const sessionSnap = await getDoc(sessionRef);
      if (sessionSnap.exists() && sessionSnap.data().queueCount) {
        await updateDoc(sessionRef, {
          queueCount: increment(-1),
        });
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handlePlayVideo = async (item: {
    id: any;
    videoUrl: string;
    name: string;
    song: string;
  }) => {
    try {
      // Remove the item from the queue using handleDeleteFromQueue
      await handleDeleteFromQueue(item.id);
      // Set the current video
      await setDoc(doc(db, "sessions", code, "currentVideo", "current"), {
        ...item,
        name: item.name,
        song: item.song,
      });
    } catch (error) {
      console.error("Error updating current video: ", error);
    }
  };

  const handleEditChange = (index: number, field: string, value: string) => {
    const updatedQueue = [...queue];
    updatedQueue[index] = {
      ...updatedQueue[index],
      [field]: value,
    };
    setQueue(updatedQueue);
  };

  const saveEdit = async (item: {
    id: any;
    name?: any;
    song?: any;
    videoUrl?: any;
  }) => {
    try {
      await updateDoc(doc(db, "sessions", code, "queue", item.id), {
        name: item.name,
        song: item.song,
        videoUrl: item.videoUrl,
      });
      setEditingIndex(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const extractVideoId = (url: string) => {
    const match = url.match(youtubeUrlRegex);
    return match ? match[1] : null;
  };

  // Handle song input change and fetch YouTube search results
  const handleSongInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const song = e.target.value;
    setNewSong(song);
    fetchYouTubeResults(song);
  };

  // Handle YouTube result selection
  const handleSelectResult = (result: { song: string; videoUrl: string }) => {
    setNewSong(result.song);
    setNewVideoUrl(result.videoUrl);
    setSearchResults([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Loading session...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="relative grid grid-cols-1 h-screen w-full bg-background text-foreground md:grid-cols-[500px_1fr]">
      <div className="border-b md:border-r p-6 space-y-4 overflow-auto">
        <h2 className="text-2xl font-bold">Karaoke Queue</h2>
        <div className="space-y-2">
          {queue.map((item, index) =>
            item.name ? (
              <div
                key={item.id}
                className="flex items-center justify-between bg-muted p-3 rounded-md"
                onDoubleClick={() => setEditingIndex(index as unknown as null)}
              >
                {editingIndex === index ? (
                  // Render editable inputs
                  <div className="flex items-center gap-3 w-full">
                    <div className="grid gap-4 w-full">
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          handleEditChange(index, "name", e.target.value)
                        }
                        placeholder="Your Name for Queue"
                        required
                      />
                      <Input
                        value={item.song}
                        onChange={(e) =>
                          handleEditChange(index, "song", e.target.value)
                        }
                        placeholder="Song or Artist Name"
                      />
                      <Input
                        value={item.videoUrl}
                        onChange={(e) =>
                          handleEditChange(index, "videoUrl", e.target.value)
                        }
                        placeholder="Youtube Video URL"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => saveEdit(item)}
                    >
                      <CheckIcon className="w-6 h-6 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => cancelEdit()}
                    >
                      <XIcon className="w-6 h-6 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  // Render item as usual
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.song}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handlePlayVideo({
                            id: item.id,
                            videoUrl: item.videoUrl,
                            name: item.name,
                            song: item.song,
                          })
                        }
                        aria-label="Play video"
                      >
                        <ArrowRightIcon className="w-6 h-6 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFromQueue(item.id)}
                      >
                        <TrashIcon className="w-6 h-6 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : null
          )}
          <div className="flex items-center justify-start bg-muted p-3 rounded-md">
            <div className="flex items-center gap-3 w-full">
              <div className="grid gap-2 w-full">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your Name for Queue"
                  required
                />
                {newNameError && (
                  <div className="text-red-500 text-sm">{newNameError}</div>
                )}
                <Input
                  value={newSong}
                  onChange={handleSongInputChange}
                  placeholder="Type Song or Artist Name"
                />
                <Input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Insert Youtube Video URL"
                />
                {newVideoUrlError && (
                  <div className="text-red-500 text-sm">{newVideoUrlError}</div>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="bg-gray-200 p-2 rounded cursor-pointer hover:bg-gray-300"
                        onClick={() => handleSelectResult(result)}
                      >
                        {result.song}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleAddToQueue}>
              <PlusIcon className="w-6 h-6 text-green-500" />
            </Button>
          </div>
        </div>
      </div>
      <div className="border-b md:border-r p-6 space-y-4 overflow-auto">
        {currentVideo ? (
          <>
            <h2 className="text-2xl font-bold hidden md:block text-center">
              Now Singing
            </h2>
            <div className="aspect-video w-full rounded-lg overflow-hidden hidden md:block">
              <iframe
                src={`https://www.youtube.com/embed/${extractVideoId(
                  currentVideo.videoUrl
                )}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="text-center mt-4">
              <div className="text-2xl md:text-3xl font-bold">
                {currentVideo.name}
              </div>
              <div className="text-lg md:text-lg text-muted-foreground">
                {currentVideo.song}
              </div>
              <div className="text-lg p-2 text-muted-foreground font-semibold">
                Now Singing
              </div>
            </div>
          </>
        ) : (
          <div>No video currently playing</div>
        )}
      </div>

      {/* Floating button for Speed Dial */}
      <Button
        className="fixed bottom-5 left-5 rounded-lg p-4 bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover"
        onClick={() => router.push("/")}
      >
        <HomeIcon className="w-6 h-6" />
      </Button>
    </div>
  );
}

function HomeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V9h6v12" />
    </svg>
  );
}

function ArrowRightIcon(
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function PlusIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function CheckIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function XIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function TrashIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6"
      />
    </svg>
  );
}
