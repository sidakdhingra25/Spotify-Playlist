/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'mosaic.scdn.co',
        },
        {
          protocol: 'https',
          hostname: 'api.spotify.com',
        },
        {
          protocol: 'https',
          hostname: 'lastfm.freetls.fastly.net',
        },
        {
          protocol: 'https',
          hostname: 'i.scdn.co',
        },
        {
          protocol: 'https',
          hostname: 'blend-playlist-covers.spotifycdn.com',
        },
        {
          protocol: 'https',
          hostname: 'image-cdn-ak.spotifycdn.com',
        },
        {
          protocol: 'https',
          hostname: 'image-cdn-fa.spotifycdn.com',
        },
      ],
    },
    env: {
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
    },
  };
  
  export default nextConfig;
  