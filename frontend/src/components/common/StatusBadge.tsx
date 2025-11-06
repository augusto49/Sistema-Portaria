import { Badge } from "@/components/ui/badge";
import { STATUS_AGENDAMENTO } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: number;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusInfo =
    STATUS_AGENDAMENTO[status as keyof typeof STATUS_AGENDAMENTO];

  if (!statusInfo) return null;

  return (
    <Badge
      variant="outline"
      className={cn(statusInfo.color, "font-medium", className)}
    >
      {statusInfo.label}
    </Badge>
  );
}
