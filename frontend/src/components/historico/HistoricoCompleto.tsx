import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAcessos } from "@/hooks/useAcessos";
import { useSalas } from "@/hooks/useSalas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function HistoricoCompleto() {
  const [searchTerm, setSearchTerm] = useState("");
  const [salaFilter, setSalaFilter] = useState<string>("all");
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: acessos, isLoading } = useAcessos();
  const { data: salas } = useSalas();

  const filteredAcessos = acessos?.filter((acesso) => {
    const matchSearch =
      acesso.visitante?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acesso.visitante?.cpf.includes(searchTerm);

    const matchSala =
      salaFilter === "all" || acesso.sala_id.toString() === salaFilter;

    const matchDataInicio =
      !dataInicio || new Date(acesso.entrada_em) >= dataInicio;
    const matchDataFim = !dataFim || new Date(acesso.entrada_em) <= dataFim;

    // Histórico completo mostra apenas finalizados (com saída registrada)
    const jaFinalizou = acesso.saida_em !== null;

    return (
      matchSearch && matchSala && matchDataInicio && matchDataFim && jaFinalizou
    );
  });

  const totalPages = Math.ceil((filteredAcessos?.length || 0) / itemsPerPage);
  const paginatedAcessos = filteredAcessos?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSalaFilter("all");
    setDataInicio(undefined);
    setDataFim(undefined);
    setCurrentPage(1);
  };

  const hasFilters =
    searchTerm || salaFilter !== "all" || dataInicio || dataFim;

  const calcularDuracao = (entrada: string, saida: string | null) => {
    if (!saida) return "--";
    const minutos = differenceInMinutes(new Date(saida), new Date(entrada));
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico Completo de Acessos</CardTitle>
        <CardDescription>
          Registro de todas as entradas e saídas de visitantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:col-span-2 lg:col-span-1"
          />

          <Select value={salaFilter} onValueChange={setSalaFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por sala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as salas</SelectItem>
              {salas?.map((sala) => (
                <SelectItem key={sala.id} value={sala.id.toString()}>
                  {sala.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  !dataInicio && "text-muted-foreground",
                  "w-full justify-start"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Data início"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataInicio}
                onSelect={setDataInicio}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  !dataFim && "text-muted-foreground",
                  "w-full justify-start"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataFim ? format(dataFim, "dd/MM/yyyy") : "Data fim"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataFim}
                onSelect={setDataFim}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {hasFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="w-full sm:col-span-2 lg:col-span-1"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar filtros
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando histórico...
          </div>
        ) : !paginatedAcessos || paginatedAcessos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {hasFilters
              ? "Nenhum acesso encontrado com os filtros aplicados."
              : "Nenhum acesso registrado ainda."}
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {paginatedAcessos.map((acesso) => (
                <Card key={acesso.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={acesso.visitante?.foto || ""} />
                        <AvatarFallback>
                          {acesso.visitante?.nome.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {acesso.visitante?.nome}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {acesso.visitante?.cpf}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sala:</span>
                        <span>{acesso.sala?.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entrada:</span>
                        <span>
                          {format(
                            new Date(acesso.entrada_em),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saída:</span>
                        <span>
                          {acesso.saida_em ? (
                            format(
                              new Date(acesso.saida_em),
                              "dd/MM/yyyy HH:mm"
                            )
                          ) : (
                            <Badge variant="secondary">No prédio</Badge>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span>
                          {calcularDuracao(acesso.entrada_em, acesso.saida_em)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Origem:</span>
                        <span>
                          {acesso.agendamento_id ? "Agendado" : "Manual"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitante</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Sala</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAcessos.map((acesso) => (
                    <TableRow key={acesso.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={acesso.visitante?.foto || ""} />
                            <AvatarFallback>
                              {acesso.visitante?.nome.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {acesso.visitante?.nome}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {acesso.visitante?.cpf}
                      </TableCell>
                      <TableCell>{acesso.sala?.nome}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {format(new Date(acesso.entrada_em), "dd/MM/yyyy")}
                          </div>
                          <div className="text-muted-foreground">
                            {format(new Date(acesso.entrada_em), "HH:mm")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {acesso.saida_em ? (
                          <div className="text-sm">
                            <div>
                              {format(new Date(acesso.saida_em), "dd/MM/yyyy")}
                            </div>
                            <div className="text-muted-foreground">
                              {format(new Date(acesso.saida_em), "HH:mm")}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary">No prédio</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {calcularDuracao(acesso.entrada_em, acesso.saida_em)}
                      </TableCell>
                      <TableCell>
                        {acesso.agendamento_id ? "Agendado" : "Manual"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredAcessos?.length || 0
                  )}{" "}
                  de {filteredAcessos?.length} registros
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
