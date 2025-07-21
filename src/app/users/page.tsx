import { Metadata } from "next";
import { Config } from "@/config";
import UsersPage from "./UsersPage";

// Use Node.js runtime for server actions compatibility
export const runtime = "edge";

export const metadata: Metadata = {
    title: `Leaderboard - ${Config.siteDescription}`,
    description: `Leaderboard of users on ${Config.sitename}. View user ratings, ranks, and statistics.`,
}

export default async function Page() {
  return <UsersPage />;
}