"use client";

import { useState } from "react";
import { Download, FileText, Table } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ebox/ui/dropdown-menu";
import { useToast } from "@ebox/ui/hooks/use-toast";

import { api } from "../../../trpc/react";

interface ExportControlsProps {
  locationId?: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  className?: string;
  onExport?: (format: "csv" | "pdf") => void;
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

  const handleExport = async (format: "csv" | "pdf") => {
    if (isExporting) return;

    setIsExporting(true);
    console.log(`Exporting analytics data as ${format.toUpperCase()}...`);

    try {
      const result = await exportMutation.mutateAsync({
        format,
        locationId,
        dateRange,
      });

      // Call the optional callback
      onExport?.(format);

      // For now, the export returns a placeholder message
      // In a full implementation, this would trigger a download
      if (result.downloadUrl) {
        // Create download link and trigger download
        const link = document.createElement("a");
        link.href = result.downloadUrl;

        // Use the filename from the response or generate one
        const filename =
          result.filename ||
          `analytics-export-${format}-${Date.now()}.${format}`;
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
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleExport("csv")}
            disabled={isExporting}
          >
            <Table className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
