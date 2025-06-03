"use client";

import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@ebox/ui/card";
import { Skeleton } from "@ebox/ui/skeleton";

export function MetricsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function MetricsRowSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <MetricsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full" style={{ height: `${height}px` }} />
      </CardContent>
    </Card>
  );
}

export function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start space-x-3 rounded-lg border-l-4 bg-muted/20 p-3"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-3 w-48" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function HeatmapSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Heatmap grid skeleton */}
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: "auto repeat(24, 1fr)" }}
          >
            <div></div>
            {Array.from({ length: 24 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-4" />
            ))}
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <React.Fragment key={dayIndex}>
                <Skeleton className="h-8 w-8" />
                {Array.from({ length: 24 }).map((_, hourIndex) => (
                  <Skeleton key={hourIndex} className="h-8 w-8" />
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Legend skeleton */}
          <div className="flex items-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>

          {/* Peak hours skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-muted/50 p-3 text-center">
                <Skeleton className="mx-auto mb-2 h-5 w-12" />
                <Skeleton className="mx-auto mb-1 h-6 w-8" />
                <Skeleton className="mx-auto mb-1 h-3 w-20" />
                <Skeleton className="mx-auto h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Failed to load data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="space-y-4 text-center">
          <div className="text-4xl text-red-500">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
