import { useState, useEffect } from "react";

type SpotifyUser = {
  display_name: string;
  images: { url: string }[];
  product: string;
};

export function useSpotifyUserData() {
  const [userData, setUserData] = useState<SpotifyUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const userResponse = await fetch("/api/spotify/user");
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();
        setUserData(userData);

      } catch (err) {
        setError((err as Error).message || "An unknown error occurred");
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  return { userData , error };
}
