import { Download, FileText, Image, Music, X } from "lucide-react";

import { Button } from "@ebox/ui/button";

import type { UploadedFile } from "~/app/hooks/useFileUpload";

interface FileBadgeProps {
  file: UploadedFile;
  onRemove?: (url: string) => void;
  showRemove?: boolean;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) {
    return <Image className="h-3 w-3" />;
  }
  if (type.startsWith("audio/")) {
    return <Music className="h-3 w-3" />;
  }
  return <FileText className="h-3 w-3" />;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function FileBadge({
  file,
  onRemove,
  showRemove = true,
}: FileBadgeProps) {
  const handleDownload = (e: React.MouseEvent) => {
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
    <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/10 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        {getFileIcon(file.type)}
        <div className="flex flex-col">
          <span className="max-w-40 truncate font-medium text-foreground">
            {file.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="h-6 w-6 p-0"
        >
          <Download className="h-3 w-3" />
        </Button>

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
