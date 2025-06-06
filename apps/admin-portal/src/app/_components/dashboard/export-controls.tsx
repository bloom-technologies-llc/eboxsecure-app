"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@ebox/ui/button";
import { useToast } from "@ebox/ui/hooks/use-toast";

import { api } from "../../../trpc/react";

interface ExportControlsProps {
  locationId?: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  className?: string;
  onExport?: (format: "csv") => void;
}

export function ExportControls({
  locationId,
  dateRange,
  className,
  onExport,
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // TODO: Add Redis caching for performance optimization
  const exportMutation = api.analytics.exportAnalyticsData.useMutation({
    onSuccess: (result) => {
      setIsExporting(false);
      toast({
        title: "Export completed",
        description: result.message,
      });
    },
    onError: (error) => {
      setIsExporting(false);
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    console.log("Exporting analytics data as CSV...");

    try {
      const result = await exportMutation.mutateAsync({
        format: "csv",
        locationId,
        dateRange,
      });

      // Call the optional callback
      onExport?.("csv");

      if (result.downloadUrl) {
        // Create download link and trigger download
        const link = document.createElement("a");
        link.href = result.downloadUrl;

        // Use the filename from the response or generate one
        const filename =
          result.filename || `analytics-export-csv-${Date.now()}.csv`;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Export error:", error);
      // Error is handled by the mutation onError callback
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
