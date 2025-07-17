"use client";

import React from 'react';
import { getRatingClass } from '@/lib/rating';
import { Recommendations } from '@/lib/server-actions/users';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faLightbulb, faTrophy } from '@fortawesome/free-solid-svg-icons';

interface RecommendationsProps {
  recommendations?: Recommendations[];
  userRating: number;
}

export default function RecommendationsPanel({ recommendations, userRating }: RecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-6 h-fit">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" />
          Recommendations
        </h2>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No recommendations available yet.
          </p>
        </div>
      </div>
    );
  }

  // Sort recommendations by rating difficulty
  const sortedRecommendations = [...recommendations].sort((a, b) => a.rating - b.rating);

  return (
    <div className="bg-card border rounded-lg p-6 h-fit">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" />
        Recommended Problems
      </h2>
      
      <div className="space-y-3">
        {sortedRecommendations.map((rec) => {
          const difficultyLevel = rec.rating - userRating;
          let difficultyIcon = faBookOpen;
          let difficultyColor = 'text-blue-500';
          let difficultyText = 'Good Match';
          
          if (difficultyLevel > 300) {
            difficultyIcon = faTrophy;
            difficultyColor = 'text-red-500';
            difficultyText = 'Challenge';
          } else if (difficultyLevel < -200) {
            difficultyIcon = faBookOpen;
            difficultyColor = 'text-green-500';
            difficultyText = 'Practice';
          }

          return (
            <div
              key={rec.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm line-clamp-2 flex-1 mr-2">
                  {rec.title}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <FontAwesomeIcon 
                    icon={difficultyIcon} 
                    className={`w-3 h-3 ${difficultyColor}`} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${getRatingClass(rec.rating)}`}>
                  {rec.rating}
                </span>
                <span className={`${difficultyColor} font-medium`}>
                  {difficultyText}
                </span>
              </div>
              
              {Math.abs(difficultyLevel) > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {difficultyLevel > 0 ? '+' : ''}{difficultyLevel} from your rating
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Total problems:</span>
            <span className="font-medium">{recommendations.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Avg. difficulty:</span>
            <span className={`font-medium ${getRatingClass(
              Math.round(recommendations.reduce((sum, rec) => sum + rec.rating, 0) / recommendations.length)
            )}`}>
              {Math.round(recommendations.reduce((sum, rec) => sum + rec.rating, 0) / recommendations.length)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
