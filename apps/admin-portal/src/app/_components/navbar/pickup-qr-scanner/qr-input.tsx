import { Label } from "recharts";

import { Input } from "@ebox/ui/input";

interface QRInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
// QR Input Component
export default function QRInput({
  value,
  onChange,
  disabled = false,
}: QRInputProps) {
  return (
    <div className="space-y-2">
      <Label>QR Code</Label>
      <Input
        id="qr-input"
        type="text"
        placeholder="Enter QR code..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono"
        disabled={disabled}
        autoFocus
      />
    </div>
  );
}
