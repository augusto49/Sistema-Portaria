import { useState, useEffect } from "react";
import { useVisitantes } from "@/hooks/useVisitantes";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Search, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import PriorityBadge from "@/components/common/PriorityBadge";
import { Button } from "@/components/ui/button";

interface VisitanteAutocompleteProps {
  value?: number;
  onChange: (visitanteId: number) => void;
  onCreateNew?: () => void;
}

export default function VisitanteAutocomplete({
  value,
  onChange,
  onCreateNew,
}: VisitanteAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: visitantes = [], isLoading } = useVisitantes();

  const selectedVisitante = visitantes.find((v) => v.id === value);

  const filteredVisitantes = visitantes.filter((visitante) => {
    const searchLower = search.toLowerCase();
    return (
      visitante.nome.toLowerCase().includes(searchLower) ||
      visitante.cpf
        .replace(/\D/g, "")
        .includes(searchLower.replace(/\D/g, "")) ||
      (visitante.rg && visitante.rg.toLowerCase().includes(searchLower))
    );
  });

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedVisitante ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedVisitante.foto || ""} />
                  <AvatarFallback>{selectedVisitante.nome[0]}</AvatarFallback>
                </Avatar>
                <span>{selectedVisitante.nome}</span>
                <span className="text-muted-foreground text-xs">
                  ({selectedVisitante.cpf})
                </span>
              </div>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Selecionar visitante...
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Buscar por nome, CPF ou RG..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 h-11"
              />
            </div>
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Carregando visitantes...
                </div>
              ) : filteredVisitantes.length === 0 ? (
                <CommandEmpty>
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhum visitante encontrado.
                    </p>
                    {onCreateNew && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpen(false);
                          onCreateNew();
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Cadastrar novo visitante
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredVisitantes.map((visitante) => (
                    <CommandItem
                      key={visitante.id}
                      value={visitante.id.toString()}
                      onSelect={() => {
                        onChange(visitante.id);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={visitante.foto || ""} />
                          <AvatarFallback>{visitante.nome[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {visitante.nome}
                            </span>
                            {visitante.tipo_prioridade && (
                              <PriorityBadge
                                prioridade={visitante.tipo_prioridade}
                                showIcon={false}
                                className="text-xs"
                              />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            CPF: {visitante.cpf}
                            {visitante.rg && ` • RG: ${visitante.rg}`}
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "h-4 w-4",
                            value === visitante.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
