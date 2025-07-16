import { Metadata } from "next";
import { Config } from "@/config";
import UsersPage from "./UsersPage";
import { getUsersList } from "@/lib/server-actions/users";

// Use Node.js runtime for server actions compatibility
export const runtime = "nodejs";

export const metadata: Metadata = {
    title: `Leaderboard - ${Config.siteDescription}`,
    description: `Leaderboard of users on ${Config.sitename}. View user ratings, ranks, and statistics.`,
}

export default async function Page() {
  try {
    const users = await getUsersList();
    return <UsersPage initialUsers={users} />;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    // Return with mock data as fallback for development
    const mockUsers = [
      {
        id: 1,
        name: "Trung",
        shortName: "dev",
        rating: 2150,
      },
      {
        id: 2,
        name: "An Hiệp", 
        shortName: "scammer",
        rating: 1850,
      },
      {
        id: 3,
        name: "Dejia Vu?",
        shortName: "scammer",
        rating: 1420,
      },
      {
        id: 4,
        name: "Tram Vu",
        shortName: "scammer",
        rating: 950,
      }
    ];
    return <UsersPage initialUsers={mockUsers} />;
  }
}