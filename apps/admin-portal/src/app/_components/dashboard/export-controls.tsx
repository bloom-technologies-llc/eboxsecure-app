"use client";

import { Download, FileText, Table } from "lucide-react";

import { Button } from "@ebox/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ebox/ui/dropdown-menu";

interface ExportControlsProps {
  className?: string;
  onExport?: (format: "csv" | "pdf") => void;
}

export function ExportControls({ className, onExport }: ExportControlsProps) {
  const handleExport = (format: "csv" | "pdf") => {
    // For Phase 1, this will just show a placeholder
    // In Phase 4, this will call the actual export API
    console.log(`Exporting analytics data as ${format.toUpperCase()}...`);
    onExport?.(format);

    // Placeholder notification - in real implementation this would be a toast
    alert(
      `${format.toUpperCase()} export will be available in Phase 4 of the implementation`,
    );
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            <Table className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("pdf")}>
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
