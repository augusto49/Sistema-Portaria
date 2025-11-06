import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  prioridade: {
    descricao: string;
    nivel_prioridade: number;
  };
  showIcon?: boolean;
  className?: string;
}

export default function PriorityBadge({
  prioridade,
  showIcon = true,
  className,
}: PriorityBadgeProps) {
  const isPrioritario = prioridade.nivel_prioridade > 1;

  return (
    <Badge
      variant={isPrioritario ? "default" : "secondary"}
      className={cn(
        isPrioritario && "bg-warning text-warning-foreground",
        "flex items-center gap-1",
        className
      )}
    >
      {isPrioritario && showIcon && <AlertCircle className="h-3 w-3" />}
      {prioridade.descricao}
    </Badge>
  );
}
