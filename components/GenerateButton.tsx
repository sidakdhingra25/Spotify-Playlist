import { Button } from "@/components/ui/button";
import { Loader2, Music } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  loading: boolean;
}

export default function GenerateButton({ onClick, loading }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="max-w-xs bg-green-500 hover:bg-green-600 text-black py-2 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ease-in-out"
      aria-label={loading ? "Generating playlist" : "Generate playlist"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
      ) : (
        <Music className="h-4 w-4 mr-2" aria-hidden="true" />
      )}
      {loading ? "Generating..." : "Generate Playlist"}
    </Button>
  );
}