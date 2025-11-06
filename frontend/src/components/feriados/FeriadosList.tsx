import { useState, useEffect } from "react";
import { Edit, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { formatDateOnlyFromApi } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFeriados, useDeleteFeriado } from "@/hooks/useFeriados";
import { Feriado, TipoFeriado } from "@/types/database";
import FeriadoForm from "./FeriadoForm";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const getTipoLabel = (tipo: number) => {
  switch (tipo) {
    case TipoFeriado.NACIONAL:
      return "Nacional";
    case TipoFeriado.ESTADUAL:
      return "Estadual";
    case TipoFeriado.MUNICIPAL:
      return "Municipal";
    default:
      return "Desconhecido";
  }
};

const getTipoVariant = (tipo: number): "default" | "secondary" | "outline" => {
  switch (tipo) {
    case TipoFeriado.NACIONAL:
      return "default";
    case TipoFeriado.ESTADUAL:
      return "secondary";
    case TipoFeriado.MUNICIPAL:
      return "outline";
    default:
      return "outline";
  }
};

export default function FeriadosList() {
  const { data: feriados, isLoading } = useFeriados();
  const deleteFeriado = useDeleteFeriado();

  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [editingFeriado, setEditingFeriado] = useState<Feriado | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredFeriados = feriados?.filter((feriado) => {
    const matchesSearch = feriado.descricao
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTipo =
      tipoFilter === "all" || feriado.tipo.toString() === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, tipoFilter]);

  // Calcular paginação
  const totalPages = Math.ceil(
    (filteredFeriados?.length || 0) / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFeriados = filteredFeriados?.slice(startIndex, endIndex);

  // Ajustar página atual se ela ficou maior que o total após exclusão
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleDelete = async (id: number) => {
    await deleteFeriado.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando feriados...
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Lista de Feriados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value={TipoFeriado.NACIONAL.toString()}>
                  Nacional
                </SelectItem>
                <SelectItem value={TipoFeriado.ESTADUAL.toString()}>
                  Estadual
                </SelectItem>
                <SelectItem value={TipoFeriado.MUNICIPAL.toString()}>
                  Municipal
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!filteredFeriados || filteredFeriados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                Nenhum feriado encontrado
              </p>
              <p className="text-sm">
                {search || tipoFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Cadastre o primeiro feriado do sistema"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFeriados?.map((feriado) => (
                    <TableRow key={feriado.id}>
                      <TableCell className="font-medium">
                        {feriado.data
                          ? formatDateOnlyFromApi(feriado.data)
                          : "—"}
                      </TableCell>
                      <TableCell>{feriado.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={getTipoVariant(feriado.tipo)}>
                          {getTipoLabel(feriado.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingFeriado(feriado)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o feriado "
                                  {feriado.descricao}"? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(feriado.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {(filteredFeriados?.length || 0) > ITEMS_PER_PAGE && (
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

      <Dialog
        open={!!editingFeriado}
        onOpenChange={(open) => !open && setEditingFeriado(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Feriado</DialogTitle>
          </DialogHeader>
          <FeriadoForm
            feriado={editingFeriado || undefined}
            onSuccess={() => setEditingFeriado(null)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
