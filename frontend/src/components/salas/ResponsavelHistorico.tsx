import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResponsaveis, useCreateResponsavel } from "@/hooks/useSalas";
import { History, Plus } from "lucide-react";

interface ResponsavelHistoricoProps {
  salaId: number;
  open: boolean;
  onClose: () => void;
}

// Componente para Gerenciar o Histórico de Responsáveis pela Sala
export function ResponsavelHistorico({
  salaId,
  open,
  onClose,
}: ResponsavelHistoricoProps) {
  const { data: responsaveis = [] } = useResponsaveis(salaId);
  const createResponsavel = useCreateResponsavel();
  const [showAddForm, setShowAddForm] = useState(false);
  const [novoResponsavel, setNovoResponsavel] = useState({
    nome: "",
    valido_de: format(new Date(), "yyyy-MM-dd"),
  });

  const handleAddResponsavel = async () => {
    if (!novoResponsavel.nome.trim()) return;

    try {
      await createResponsavel.mutateAsync({
        sala_id: salaId,
        nome: novoResponsavel.nome,
        valido_de: novoResponsavel.valido_de,
      });
      setNovoResponsavel({
        nome: "",
        valido_de: format(new Date(), "yyyy-MM-dd"),
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Erro ao adicionar responsável:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Responsáveis
          </DialogTitle>
          <DialogDescription>
            Gerencie o histórico de responsáveis por esta sala
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novo Responsável
            </Button>
          )}

          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Novo Responsável</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={novoResponsavel.nome}
                    onChange={(e) =>
                      setNovoResponsavel({
                        ...novoResponsavel,
                        nome: e.target.value,
                      })
                    }
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Válido Desde</Label>
                  <Input
                    type="date"
                    value={novoResponsavel.valido_de}
                    onChange={(e) =>
                      setNovoResponsavel({
                        ...novoResponsavel,
                        valido_de: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddResponsavel}
                  disabled={createResponsavel.isPending}
                  className="flex-1"
                >
                  {createResponsavel.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNovoResponsavel({
                      nome: "",
                      valido_de: format(new Date(), "yyyy-MM-dd"),
                    });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Válido Desde</TableHead>
                  <TableHead>Válido Até</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responsaveis.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      Nenhum responsável cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  responsaveis.map((resp) => (
                    <TableRow key={resp.id}>
                      <TableCell className="font-medium">{resp.nome}</TableCell>
                      <TableCell>
                        {format(new Date(resp.valido_de), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {resp.valido_ate
                          ? format(new Date(resp.valido_ate), "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {!resp.valido_ate ? (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                            Atual
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted text-muted-foreground">
                            Anterior
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
