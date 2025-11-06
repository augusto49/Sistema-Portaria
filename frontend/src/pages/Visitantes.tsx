import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VisitantesList from "@/components/visitantes/VisitantesList";

export default function Visitantes() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visitantes</CardTitle>
          <CardDescription>
            Gerenciamento de visitantes do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VisitantesList />
        </CardContent>
      </Card>
    </div>
  );
}
