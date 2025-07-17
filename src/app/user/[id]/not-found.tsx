"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/magicui/magic-card";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import { useParams } from "next/navigation";

export default function NotFound() {
  const { theme } = useTheme();
  const { username } = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="p-0 max-w-lg w-full shadow-none border-none">
        <MagicCard
          gradientColor={mounted && theme === "dark" ? "#262626" : "#D9D9D955"}
          className="p-0"
        >
          <CardHeader className="text-center p-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Ghost className="h-16 w-16 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">!</span>
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              User not found
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              We cannot find the user {username}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                The user you&apos;re looking for doesn&apos;t exist or is
                unavailable. Please check your spelling or explore the users
                list page.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="flex-1">
                  <Link href="/users">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Users list
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </MagicCard>
      </Card>
    </div>
  );
}
