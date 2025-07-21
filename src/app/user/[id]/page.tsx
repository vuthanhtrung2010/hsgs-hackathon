import { Metadata } from "next";
import { Config } from "@/config";
import { getUserData } from "@/lib/server-actions/users";
import UserPage from "./UserPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const user = await getUserData(id);
    if (!user) {
      return {
        title: `No such user - ${Config.siteDescription}`,
        description: "User not found",
      };
    }
    return {
      title: `User ${user.name} - ${Config.siteDescription}`,
      description: `Profile of user ${user.name}. Rating: ${user.rating}`,
    };
  } catch {
    return {
      title: `No such user - ${Config.siteDescription}`,
      description: "User not found",
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <UserPage userId={id} />
  );
}