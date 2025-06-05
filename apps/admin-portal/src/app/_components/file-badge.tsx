import { FileText, X } from "lucide-react";

import { Button } from "@ebox/ui/button";

import type { UploadedFile } from "~/app/hooks/useFileUpload";

interface FileBadgeProps {
  file: UploadedFile;
  onRemove?: (url: string) => void;
  showRemove?: boolean;
}

export default function FileBadge({
  file,
  onRemove,
  showRemove = true,
}: FileBadgeProps) {
  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(file.url, "_blank");
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(file.url);
  };

  return (
    <div
      onClick={handlePreview}
      className="flex items-center gap-2 rounded-md border border-border bg-secondary/10 px-3 py-2 text-sm hover:cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <div className="flex flex-col">
          <span className="max-w-40 truncate font-medium text-foreground">
            {file.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {showRemove && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
