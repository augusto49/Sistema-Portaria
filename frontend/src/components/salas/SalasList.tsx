import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSalas, useDeleteSala } from "@/hooks/useSalas";
import { Sala } from "@/types/database";
import {
  Edit,
  Trash2,
  Search,
  History,
  Clock,
  CalendarClock,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ResponsavelHistorico } from "./ResponsavelHistorico";
import HistoricoSala from "./HistoricoSala";

interface SalasListProps {
  onEdit: (id: number) => void;
}

const VARIACAO_LABELS: Record<number, string> = {
  1: "Hora",
  2: "Dia",
  3: "Semana",
  4: "Mês",
};

// Componente para Listar e Gerenciar Salas
export function SalasList({ onEdit }: SalasListProps) {
  const { data: salas = [], isLoading } = useSalas();
  const deleteSala = useDeleteSala();
  const [searchTerm, setSearchTerm] = useState("");
  const [salaToDelete, setSalaToDelete] = useState<number | null>(null);
  const [historicoResponsavelId, setHistoricoResponsavelId] = useState<
    number | null
  >(null);
  const [historicoSala, setHistoricoSala] = useState<{
    id: number;
    nome: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredSalas = salas.filter((sala) =>
    sala.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginação
  const totalPages = Math.ceil(filteredSalas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSalas = filteredSalas.slice(startIndex, endIndex);

  // Reset para página 1 quando filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async () => {
    if (salaToDelete) {
      await deleteSala.mutateAsync(salaToDelete);
      setSalaToDelete(null);
    }
  };

  const getResponsavelAtual = (sala: Sala) => {
    const responsaveis = sala.responsaveis || [];

    if (responsaveis.length === 0) {
      return "Sem responsável";
    }

    // Procura o responsável ativo — sem data final ou ainda válido
    const atual = responsaveis.find(
      (r) => !r.valido_ate || new Date(r.valido_ate) >= new Date()
    );

    return atual ? atual.nome : "Sem responsável";
  };

  const getHorariosSummary = (
    disponibilidade: Record<string, { inicio: string; fim: string }[]>
  ) => {
    const diasComHorario = Object.keys(disponibilidade).filter(
      (dia) => disponibilidade[dia].length > 0
    );
    if (diasComHorario.length === 0) return "Sem horários";
    if (diasComHorario.length === 7) return "7 dias configurados";
    return `${diasComHorario.length} dias configurados`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Carregando salas...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Salas Cadastradas</CardTitle>
              <CardDescription>
                {filteredSalas.length > ITEMS_PER_PAGE
                  ? `Mostrando ${startIndex + 1}-${Math.min(
                      endIndex,
                      filteredSalas.length
                    )} de ${filteredSalas.length} sala(s)`
                  : `${filteredSalas.length} sala(s) encontrada(s)`}
              </CardDescription>
            </div>
            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar sala..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSalas.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "Nenhuma sala encontrada com esse termo de busca"
                : "Nenhuma sala cadastrada ainda"}
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Variação</TableHead>
                    <TableHead>Horários</TableHead>
                    <TableHead>Responsável Atual</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSalas.map((sala) => (
                    <TableRow key={sala.id}>
                      <TableCell className="font-medium">{sala.nome}</TableCell>
                      <TableCell>{sala.capacidade} pessoa(s)</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {VARIACAO_LABELS[sala.variacao_capacidade]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {getHorariosSummary(sala.disponibilidade)}
                        </div>
                      </TableCell>
                      <TableCell>{getResponsavelAtual(sala)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setHistoricoSala({ id: sala.id, nome: sala.nome })
                            }
                            title="Ver histórico de agendamentos e acessos"
                          >
                            <CalendarClock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setHistoricoResponsavelId(sala.id)}
                            title="Ver histórico de responsáveis"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(sala.id)}
                            title="Editar sala"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSalaToDelete(sala.id)}
                            title="Remover sala"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredSalas.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!salaToDelete}
        onOpenChange={() => setSalaToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta sala? Esta ação desativará a
              sala mas manterá seu histórico de agendamentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {historicoResponsavelId && (
        <ResponsavelHistorico
          salaId={historicoResponsavelId}
          open={!!historicoResponsavelId}
          onClose={() => setHistoricoResponsavelId(null)}
        />
      )}

      {historicoSala && (
        <HistoricoSala
          salaId={historicoSala.id}
          salaNome={historicoSala.nome}
          open={!!historicoSala}
          onClose={() => setHistoricoSala(null)}
        />
      )}
    </>
  );
}
