'use client';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    LogOut,HeartPulseIcon,Star
} from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

interface ProfileProps {
    userData: any;
    onLogout: () => void;
  }

export const Profile: React.FC<ProfileProps> = ({ userData, onLogout }) => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Call the logout API endpoint to clear cookies
            const response = await fetch('/api/spotify/logout', {
                method: 'POST',
            });

            if (response.ok) {
                // Call the onLogout callback to update parent component state
                onLogout();
                router.push('/');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-[2.25rem] h-[2.25rem]">
                <Avatar>
                    <AvatarImage
                        src={userData?.images?.[0]?.url}
                        alt="User Profile"
                    />
                    <AvatarFallback>
                        {userData?.display_name?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border border-zinc-100">
                <DropdownMenuLabel>{userData?.display_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                </DropdownMenuGroup>
                <DropdownMenuItem
                    className="border dark:border-zinc-800 border-slate-100 mt-[0.15rem]"
                >
                    <Link href='/dashboard/ai-playlist' className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    <span>Generate playlists</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="border dark:border-zinc-800 border-slate-100 mt-[0.15rem]"
                >
                    <Link href='/dashboard/ai-prego' className="flex items-center">
                    <HeartPulseIcon className="mr-2 h-4 w-4" />
                    <span>Generate favourites</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="border dark:border-zinc-800 border-slate-100 mt-[0.15rem]"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}