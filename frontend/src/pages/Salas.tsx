import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SalaForm } from "@/components/salas/SalaForm";
import { SalasList } from "@/components/salas/SalasList";

export default function Salas() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSalaId, setEditingSalaId] = useState<number | undefined>();

  const handleEdit = (id: number) => {
    setEditingSalaId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSalaId(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salas</h1>
          <p className="text-muted-foreground">
            Gerencie as salas, horários de funcionamento e responsáveis
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Sala
        </Button>
      </div>

      <SalasList onEdit={handleEdit} />

      <SalaForm
        open={isFormOpen}
        onClose={handleCloseForm}
        salaId={editingSalaId}
      />
    </div>
  );
}
