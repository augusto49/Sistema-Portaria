import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  formatDateFromDateTimeApi,
  formatTimeFromDateTimeApi,
} from "@/lib/date";
import { useAgendamentos, useUpdateAgendamento } from "@/hooks/useAgendamentos";
import { useCreateAcesso, useRegistrarSaida } from "@/hooks/useAcessos";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  MoreVertical,
  Search,
  LogIn,
  LogOut,
  XCircle,
  Check,
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import PriorityBadge from "@/components/common/PriorityBadge";
import { Agendamento } from "@/types/database";
import api from "@/lib/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AgendamentosListProps {
  statusFilter?: number;
}

export default function AgendamentosList({
  statusFilter,
}: AgendamentosListProps) {
  const [search, setSearch] = useState("");
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { data: agendamentos = [], isLoading } = useAgendamentos();
  const updateAgendamento = useUpdateAgendamento();
  const createAcesso = useCreateAcesso();
  const registrarSaida = useRegistrarSaida();

  const filteredAgendamentos = agendamentos.filter((agendamento) => {
    const matchesSearch =
      !search ||
      agendamento.visitante?.nome
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      agendamento.sala?.nome.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || agendamento.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Ordenar por criado_em
  const sortedAgendamentos = [...filteredAgendamentos].sort(
    (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Calcular paginação
  const totalPages = Math.ceil(sortedAgendamentos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAgendamentos = sortedAgendamentos.slice(startIndex, endIndex);

  // Ajustar página atual se ela ficou maior que o total após exclusão/cancelamento
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Confirmar Agendamento
  const handleConfirmar = async (agendamento: Agendamento) => {
    try {
      await createAcesso.mutateAsync({
        visitante_id: agendamento.visitante_id,
        sala_id: agendamento.sala_id!,
        agendamento_id: agendamento.id,
        entrada_em: new Date().toISOString(),
      });

      await updateAgendamento.mutateAsync({
        id: agendamento.id,
        status: 3,
      });
    } catch (error) {
      // Error handled by hooks
    }
  };

  // Registrar Entrada
  const handleRegistrarEntrada = async (agendamento: Agendamento) => {
    try {
      await createAcesso.mutateAsync({
        visitante_id: agendamento.visitante_id,
        sala_id: agendamento.sala_id!,
        agendamento_id: agendamento.id,
        entrada_em: new Date().toISOString(),
      });

      await updateAgendamento.mutateAsync({
        id: agendamento.id,
        status: 3,
      });
    } catch (error) {
      // Error handled by hooks
    }
  };

  // Registrar Saída
  const handleRegistrarSaida = async (agendamento: Agendamento) => {
    try {
      const { data: acesso } = await api.get(
        `/acessos/agendamento/${agendamento.id}`
      );

      if (acesso) {
        await registrarSaida.mutateAsync(acesso.id);

        await updateAgendamento.mutateAsync({
          id: agendamento.id,
          status: 4,
        });
      }
    } catch (error) {
      // Error handled by hooks
    }
  };

  // Cancelar Agendamento
  const handleCancelar = async () => {
    if (cancelingId) {
      // Atualizar para status 5 (Cancelado)
      await updateAgendamento.mutateAsync({
        id: cancelingId,
        status: 5,
      });
      setCancelingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-full bg-muted animate-pulse rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  if (sortedAgendamentos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por visitante ou sala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-center py-12 text-muted-foreground">
          {search
            ? "Nenhum agendamento encontrado com os filtros aplicados."
            : statusFilter
            ? "Nenhum agendamento com este status."
            : "Nenhum agendamento cadastrado."}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por visitante ou sala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {paginatedAgendamentos.map((agendamento) => {
            return (
              <div
                key={agendamento.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={agendamento.visitante?.foto || ""} />
                    <AvatarFallback>
                      {agendamento.visitante?.nome[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {agendamento.visitante?.nome}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {agendamento.visitante?.cpf}
                    </div>
                    {agendamento.visitante?.tipo_prioridade && (
                      <PriorityBadge
                        prioridade={agendamento.visitante.tipo_prioridade}
                        showIcon={false}
                        className="text-xs mt-1"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sala:</span>
                    <span className="font-medium">
                      {agendamento.sala?.nome}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>
                      {formatDateFromDateTimeApi(agendamento.data_agendada)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span>
                      {formatTimeFromDateTimeApi(agendamento.data_agendada)} -{" "}
                      {formatTimeFromDateTimeApi(agendamento.hora_fim)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <StatusBadge status={agendamento.status} />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MoreVertical className="h-4 w-4 mr-2" />
                      Ações
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {agendamento.status === 1 && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleConfirmar(agendamento)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Confirmar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setCancelingId(agendamento.id)}
                          className="text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar
                        </DropdownMenuItem>
                      </>
                    )}
                    {agendamento.status === 3 && (
                      <DropdownMenuItem
                        onClick={() => handleRegistrarSaida(agendamento)}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Registrar Saída
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitante</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAgendamentos.map((agendamento) => {
                return (
                  <TableRow key={agendamento.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={agendamento.visitante?.foto || ""}
                          />
                          <AvatarFallback>
                            {agendamento.visitante?.nome[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {agendamento.visitante?.nome}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {agendamento.visitante?.cpf}
                          </div>
                          {agendamento.visitante?.tipo_prioridade && (
                            <PriorityBadge
                              prioridade={agendamento.visitante.tipo_prioridade}
                              showIcon={false}
                              className="text-xs mt-1"
                            />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {agendamento.sala?.nome}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cap: {agendamento.sala?.capacidade}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDateFromDateTimeApi(agendamento.data_agendada)}
                    </TableCell>
                    <TableCell>
                      {formatTimeFromDateTimeApi(agendamento.data_agendada)} -{" "}
                      {formatTimeFromDateTimeApi(agendamento.hora_fim)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={agendamento.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {agendamento.status === 1 && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleConfirmar(agendamento)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Confirmar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setCancelingId(agendamento.id)}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            </>
                          )}

                          {agendamento.status === 3 && (
                            <DropdownMenuItem
                              onClick={() => handleRegistrarSaida(agendamento)}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Registrar Saída
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {sortedAgendamentos.length > ITEMS_PER_PAGE && (
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
      </div>

      <AlertDialog
        open={!!cancelingId}
        onOpenChange={() => setCancelingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelar}>
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
