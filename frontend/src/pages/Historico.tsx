import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AcessosAtivosComRegistro } from '@/components/historico/AcessosAtivosComRegistro';
import { HistoricoCompleto } from '@/components/historico/HistoricoCompleto';
import { Users, History } from 'lucide-react';

export default function Historico() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Acessos</h1>
        <p className="text-muted-foreground">
          Controle de entradas e saídas de visitantes
        </p>
      </div>

      <Tabs defaultValue="predio" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predio" className="gap-2">
            <Users className="h-4 w-4" />
            No Prédio
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="h-4 w-4" />
            Histórico Completo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predio" className="space-y-4">
          <AcessosAtivosComRegistro />
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <HistoricoCompleto />
        </TabsContent>
      </Tabs>
    </div>
  );
}
