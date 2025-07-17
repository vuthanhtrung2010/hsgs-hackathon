"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { getRatingClass, getRatingTitle } from "@/lib/rating";

interface RatingChange {
  date: string;
  rating: number;
}

interface RatingChartProps {
  ratingChanges: RatingChange[];
  minRating: number;
  maxRating: number;
  currentRating: number;
}

// Get rating color based on rating value
function getRatingColor(rating: number): string {
  if (rating === 0) return "#999999";
  if (rating >= 3000) return "#e00000";
  if (rating >= 2400) return "#e00000";
  if (rating >= 2100) return "#e00000";
  if (rating >= 1900) return "#ffb100";
  if (rating >= 1600) return "#800080";
  if (rating >= 1300) return "#0000ff";
  if (rating >= 1000) return "#00a900";
  return "#999999";
}

// Get rating tier boundaries for reference lines
const getRatingTiers = () => [
  { value: 3000, label: "Admin", color: "#e00000" },
  { value: 2400, label: "Target", color: "#e00000" },
  { value: 2100, label: "Grandmaster", color: "#e00000" },
  { value: 1900, label: "Master", color: "#ffb100" },
  { value: 1600, label: "Candidate Master", color: "#800080" },
  { value: 1300, label: "Expert", color: "#0000ff" },
  { value: 1000, label: "Amateur", color: "#00a900" },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date);
    const rating = data.rating;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{format(date, "MMM dd, yyyy")}</p>
        <p className={`text-lg font-bold ${getRatingClass(rating)}`}>
          {rating} ({getRatingTitle(rating)})
        </p>
        {data.change && (
          <p
            className={`text-sm ${
              data.change > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {data.change > 0 ? "+" : ""}
            {data.change}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom dot component for data points
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const rating = payload.rating;
  const color = getRatingColor(rating);

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill={color}
      stroke="#ffffff"
      strokeWidth={1}
      className="cursor-pointer hover:r-4 transition-all"
    />
  );
};

export default function RatingChart({
  ratingChanges,
  minRating,
  maxRating,
  currentRating,
}: RatingChartProps) {
  // Process data to include rating changes
  const processedData = ratingChanges.map((change, index) => {
    const prevRating =
      index > 0 ? ratingChanges[index - 1].rating : change.rating;
    return {
      ...change,
      change: index > 0 ? change.rating - prevRating : 0,
      formattedDate: format(new Date(change.date), "MMM dd"),
    };
  });

  // Calculate Y-axis domain with some padding
  const padding = Math.max(100, (maxRating - minRating) * 0.1);
  const yMin = Math.max(0, minRating - padding);
  const yMax = maxRating + padding;

  // Get relevant rating tiers for reference lines
  const relevantTiers = getRatingTiers().filter(
    (tier) => tier.value >= yMin && tier.value <= yMax
  );

  if (ratingChanges.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-md border border-border">
        <p className="text-sm text-muted-foreground">
          No rating history available
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full aspect-[2/1]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />

            <XAxis
              dataKey="formattedDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />

            <YAxis
              domain={[yMin, yMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => value.toString()}
            />

            {/* Rating tier reference lines */}
            {relevantTiers.map((tier) => (
              <ReferenceLine
                key={tier.value}
                y={tier.value}
                stroke={tier.color}
                strokeDasharray="2 2"
                strokeOpacity={0.3}
              />
            ))}

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="rating"
              stroke={getRatingColor(currentRating)}
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{
                r: 4,
                stroke: getRatingColor(currentRating),
                strokeWidth: 2,
                fill: "#ffffff",
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Rating tier legend */}
        <div className="mt-4 w-full">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs break-words">
            {relevantTiers.map((tier) => (
              <div
                key={tier.value}
                className="flex items-center gap-1 whitespace-nowrap"
              >
                <div
                  className="w-3 h-0.5 flex-shrink-0"
                  style={{ backgroundColor: tier.color, opacity: 0.6 }}
                />
                <span className="text-muted-foreground text-xs">
                  {tier.value} ({tier.label})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
