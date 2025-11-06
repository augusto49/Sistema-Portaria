import { useState, useEffect } from "react";
import { Search, UserPlus, Pencil, Trash2, History } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useVisitantes, useDeleteVisitante } from "@/hooks/useVisitantes";
import { Visitante } from "@/types/database";
import PriorityBadge from "@/components/common/PriorityBadge";
import VisitanteForm from "./VisitanteForm";
import HistoricoVisitante from "./HistoricoVisitante";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Componente para Listar e Gerenciar Visitantes
export default function VisitantesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisitante, setEditingVisitante] = useState<
    Visitante | undefined
  >();
  const [historicoVisitante, setHistoricoVisitante] = useState<{
    id: number;
    nome: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Formatar data sem conversão de timezone
  const formatDateOnlyBR = (value: string | null | undefined) => {
    if (!value) return "-";
    const datePart = value.slice(0, 10); // yyyy-MM-dd
    const [y, m, d] = datePart.split("-");
    if (!y || !m || !d) return "-";
    return `${d}/${m}/${y}`;
  };

  const { data: visitantes = [], isLoading } = useVisitantes();
  const deleteVisitante = useDeleteVisitante();

  const filteredVisitantes = visitantes.filter(
    (v) =>
      v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.rg && v.rg.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginação
  const totalPages = Math.ceil(filteredVisitantes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVisitantes = filteredVisitantes.slice(startIndex, endIndex);

  // Reset para página 1 quando filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Ajustar página atual se ela ficou maior que o total após exclusão
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleEdit = (visitante: Visitante) => {
    setEditingVisitante(visitante);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteVisitante.mutateAsync(id);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingVisitante(undefined);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando visitantes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou RG..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingVisitante(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Visitante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVisitante
                  ? "Editar Visitante"
                  : "Cadastrar Novo Visitante"}
              </DialogTitle>
            </DialogHeader>
            <VisitanteForm
              visitante={editingVisitante}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredVisitantes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm
              ? "Nenhum visitante encontrado."
              : "Nenhum visitante cadastrado ainda."}
          </div>
        ) : (
          paginatedVisitantes.map((visitante) => (
            <Card key={visitante.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={visitante.foto || undefined} />
                    <AvatarFallback>
                      {visitante.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{visitante.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      CPF: {visitante.cpf}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      RG: {visitante.rg || "-"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Nascimento:</span>
                    <span>{formatDateOnlyBR(visitante.data_nascimento)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prioridade:</span>
                    {visitante.tipo_prioridade && (
                      <PriorityBadge prioridade={visitante.tipo_prioridade} />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cadastrado:</span>
                    <span>
                      {visitante.criado_em
                        ? format(new Date(visitante.criado_em), "dd/MM/yyyy")
                        : "-"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      setHistoricoVisitante({
                        id: visitante.id,
                        nome: visitante.nome,
                      })
                    }
                  >
                    <History className="h-4 w-4 mr-2" />
                    Histórico
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(visitante)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o visitante{" "}
                          <strong>{visitante.nome}</strong>? Esta ação não pode
                          ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(visitante.id)}
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>RG</TableHead>
              <TableHead>Data Nasc.</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisitantes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm
                    ? "Nenhum visitante encontrado."
                    : "Nenhum visitante cadastrado ainda."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedVisitantes.map((visitante) => (
                <TableRow key={visitante.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={visitante.foto || undefined} />
                      <AvatarFallback>
                        {visitante.nome.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {visitante.nome}
                  </TableCell>
                  <TableCell>{visitante.cpf}</TableCell>
                  <TableCell>{visitante.rg || "-"}</TableCell>
                  <TableCell>
                    {formatDateOnlyBR(visitante.data_nascimento)}
                  </TableCell>
                  <TableCell>
                    {visitante.tipo_prioridade && (
                      <PriorityBadge prioridade={visitante.tipo_prioridade} />
                    )}
                  </TableCell>
                  <TableCell>
                    {visitante.criado_em
                      ? format(
                          new Date(visitante.criado_em),
                          "dd/MM/yyyy HH:mm"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setHistoricoVisitante({
                            id: visitante.id,
                            nome: visitante.nome,
                          })
                        }
                        title="Ver histórico"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(visitante)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirmar exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover o visitante{" "}
                              <strong>{visitante.nome}</strong>? Esta ação não
                              pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(visitante.id)}
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredVisitantes.length > ITEMS_PER_PAGE && (
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

      {historicoVisitante && (
        <HistoricoVisitante
          visitanteId={historicoVisitante.id}
          visitanteNome={historicoVisitante.nome}
          open={!!historicoVisitante}
          onClose={() => setHistoricoVisitante(null)}
        />
      )}
    </div>
  );
}
