"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase/firebaseConfig";
import axios from "axios";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { JSX, SVGProps, useEffect, useState } from "react";

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
  const [newName, setNewName] = useState("");
  const [newSong, setNewSong] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newNameError, setNewNameError] = useState("");
  const [newVideoUrlError, setNewVideoUrlError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  const fetchYouTubeResults = async (query: string) => {
    const MIN_QUERY_LENGTH = 8;
    if (!query || !YOUTUBE_API_KEY) return;
  
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
  
      // Get the video IDs from the search results
      const videoIds = response.data.items.map((item: any) => item.id.videoId).join(",");
  
      // Make a second request to get video status (embeddable)
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
  
      // Combine snippet data with the embeddable status
      const results = response.data.items
        .filter((item: any) => embeddableVideos.find((video: any) => video.id === item.id.videoId))
        .map((item: any) => ({
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          song: item.snippet.title,
        }));
  
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    }
  };

  // Verify that the session code exists
  useEffect(() => {
    if (!code) {
      router.push("/enter-code");
      return;
    }

    const sessionRef = doc(db, "sessions", code);
    getDoc(sessionRef)
      .then((docSnap) => {
        if (!docSnap.exists()) {
          router.push("/enter-code");
        }
      })
      .catch((error) => {
        console.error("Error checking session: ", error);
        router.push("/enter-code");
      });
  }, [code, router]);

  // Fetch queue and current video data from Firestore
  useEffect(() => {
    if (!code) return;

    const queueRef = collection(db, "sessions", code, "queue");
    const q = query(queueRef, orderBy("addedAt"));

    const unsubscribeQueue = onSnapshot(
      q,
      (snapshot) => {
        const queueData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
          setCurrentVideo(data as Video);
        } else {
          setCurrentVideo(null);
        }
      },
      (error) => {
        console.error("Error fetching current video data:", error);
      }
    );

    return () => {
      unsubscribeQueue();
      unsubscribeCurrentVideo();
    };
  }, [code]);

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
        song: newSong || "",
        videoUrl: newVideoUrl,
        addedAt: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, "sessions", code, "queue"), newQueueItem);
        setNewName("");
        setNewSong("");
        setNewVideoUrl("");
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const handleDeleteFromQueue = async (id: string) => {
    try {
      await deleteDoc(doc(db, "sessions", code, "queue", id));
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
      await deleteDoc(doc(db, "sessions", code, "queue", item.id));
      await setDoc(doc(db, "sessions", code, "currentVideo", "current"), {
        ...item,
      });
    } catch (error) {
      console.error("Error updating current video: ", error);
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(youtubeUrlRegex);
    return match ? match[1] : null;
  };

  const handleSongInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const song = e.target.value;
    setNewSong(song);
    fetchYouTubeResults(song);
  };

  const handleSelectResult = (result: { song: string; videoUrl: string }) => {
    setNewSong(result.song);
    setNewVideoUrl(result.videoUrl);
    setSearchResults([]);
  };

  if (loading) {
    return <div>Loading session...</div>;
  }

  return (
    <div className="relative grid grid-cols-1 h-screen w-full bg-background text-foreground md:grid-cols-[500px_1fr]">
      <div className="border-b md:border-r p-6 space-y-4 overflow-auto">
        <h2 className="text-2xl font-bold">Karaoke Queue</h2>
        <div className="space-y-2">
          {queue.map((item) =>
            item.name ? (
              <div
                key={item.id}
                className="flex items-center justify-between bg-muted p-3 rounded-md"
              >
                <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteFromQueue(item.id)}
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </Button>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.song}
                    </div>
                  </div>
                </div>
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
                  placeholder="Insert YouTube Video URL"
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
      {currentVideo && (
        <div className="p-6">
          <div className="aspect-video w-full rounded-lg overflow-hidden">
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
        </div>
      )}
    </div>
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
