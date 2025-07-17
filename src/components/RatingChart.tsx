"use client";

import React, { useMemo } from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  LineSeries,
  Tooltip,
  DateTime,
  Zoom,
  StripLine,
  IPointRenderEventArgs,
} from "@syncfusion/ej2-react-charts";
import { useTheme } from "next-themes";

interface RatingChange {
  date: string;
  rating: number;
}

interface RatingChartProps {
  ratingChanges: RatingChange[];
  minRating: number;
  maxRating: number;
}

const TIERS = [
  { value: 0, bgColor: "rgba(153,153,153,0.2)" },
  { value: 1000, bgColor: "rgba(0,169,0,0.2)" },
  { value: 1300, bgColor: "rgba(0,0,255,0.2)" },
  { value: 1600, bgColor: "rgba(128,0,128,0.2)" },
  { value: 1900, bgColor: "rgba(255,177,0,0.2)" },
  { value: 2100, bgColor: "rgba(224,0,0,0.2)" },
  { value: 2400, bgColor: "rgba(224,0,0,0.2)" },
  { value: 3000, bgColor: "rgba(224,0,0,0.2)" },
];

export default function RatingChart({
  ratingChanges,
  minRating,
  maxRating,
}: RatingChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const rawData = useMemo(
    () =>
      ratingChanges.map((c) => ({
        x: new Date(c.date),
        y: c.rating,
      })),
    [ratingChanges]
  );

  const maxPoint = rawData.reduce(
    (prev, curr) => (curr.y > prev.y ? curr : prev),
    rawData[0]
  );

  // Inject isHighest field for each point
  const data = rawData.map((pt) => ({
    ...pt,
    isHighest: pt.x.getTime() === maxPoint.x.getTime() && pt.y === maxPoint.y,
  }));

  const stripLines = TIERS.filter((t) => t.value <= maxRating + 200).map(
    (t, i, arr) => ({
      start: t.value,
      end: arr[i + 1] ? arr[i + 1].value : maxRating + 200,
      visible: true,
      opacity: isDark ? 0.4 : 0.2,
      zIndex: "Behind" as const,
      color: t.bgColor,
    })
  );

  const handlePointRender = (args: IPointRenderEventArgs) => {
    const pointData = data[args.point.index];
    if (!pointData) return;

    args.fill = "white";
    args.border = {
      color: pointData.isHighest ? "#e00000" : "#eab308",
      width: pointData.isHighest ? 3 : 2,
    };
  };

  return (
    <ChartComponent
      id="rating-chart"
      primaryXAxis={{
        valueType: "DateTime",
        labelFormat: "MMM dd",
        edgeLabelPlacement: "Shift",
        majorGridLines: { width: 0 },
      }}
      primaryYAxis={{
        title: "Rating",
        minimum: Math.floor((minRating - 100) / 200) * 200,
        maximum: Math.ceil((maxRating + 100) / 200) * 200,
        interval: 200,
        stripLines,
        majorGridLines: { width: 0 },
      }}
      tooltip={{
        enable: true,
        shared: false,
        format: "${point.y}",
        header: "${point.x}",
      }}
      zoomSettings={{
        enableMouseWheelZooming: true,
        enablePinchZooming: true,
        enableSelectionZooming: true,
        mode: "X",
      }}
      chartArea={{ border: { width: 0 } }}
      pointRender={handlePointRender}
    >
      <Inject services={[LineSeries, Tooltip, DateTime, Zoom, StripLine]} />
      <SeriesCollectionDirective>
        <SeriesDirective
          dataSource={data}
          xName="x"
          yName="y"
          type="Line"
          width={2}
          fill="#eab308"
          marker={{
            visible: true,
            width: 8,
            height: 8,
            shape: "Circle",
          }}
        />
      </SeriesCollectionDirective>
    </ChartComponent>
  );
}
