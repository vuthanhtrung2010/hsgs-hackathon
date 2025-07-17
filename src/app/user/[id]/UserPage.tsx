"use client";

import Image from "next/image";
import { IUserData } from "@/lib/server-actions/users";
import { getRatingClass, getRatingTitle } from "@/lib/rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import RatingChart from "@/components/RatingChart";
import RatingDisplay from "@/components/RatingDisplay";

interface UserPageProps {
  userData: IUserData;
  userRank?: number;
}

export default function UserPage({ userData, userRank }: UserPageProps) {
  return (
    <main className="max-w-6xl mx-auto py-8 px-4">
      <div className="user-profile grid md:grid-cols-[250px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="user-sidebar">
          <div className="mb-6 flex flex-col items-center">
            {userData.avatarURL ? (
              <Image
                src={userData.avatarURL}
                alt={`${userData.name}'s avatar`}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-16 h-16 text-gray-500"
                />
              </div>
            )}
            <h1
              className={`text-2xl font-bold ${getRatingClass(
                userData.rating
              )} text-center`}
            >
              {userData.name}
            </h1>
            <p className="text-muted-foreground text-center mb-4">
              {getRatingTitle(userData.rating)}
            </p>
            
            {/* Rating Statistics */}
            <div className="bg-card border rounded-lg p-4 w-full">
              {userRank && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted-foreground">Rank by rating:</span>
                  <span className="font-bold text-lg">#{userRank}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted-foreground">Rating:</span>
                <RatingDisplay rating={userData.rating} showIcon={true} />
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted-foreground">Min. rating:</span>
                <RatingDisplay rating={userData.minRating} showIcon={true} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Max. rating:</span>
                <RatingDisplay rating={userData.maxRating} showIcon={true} />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4 mt-4">
            <Link
              href={`/user/${userData.id}/submissions`}
              className="text-primary hover:underline block"
            >
              View all submissions
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="user-content">
          {/* Activity Heatmap */}
          {/* <div className="bg-card border rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Submission Activity</h2>
                        
                        {userData.submissions.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No submissions yet.
                            </p>
                        ) : (
                            <div className="submission-activity">
                                <ActivityHeatmap submissions={userData.submissions} />
                            </div>
                        )}
                    </div> */}

          {/* Rating History */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Rating History</h2>
            {userData.ratingChanges && userData.ratingChanges.length > 0 ? (
              <div className="w-full">
                <RatingChart
                  ratingChanges={userData.ratingChanges}
                  minRating={userData.minRating}
                  maxRating={userData.maxRating}
                  currentRating={userData.rating}
                />
              </div>
            ) : (
              <div className="relative w-full h-[300px] bg-muted/20 rounded-md border border-border">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No rating history available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
