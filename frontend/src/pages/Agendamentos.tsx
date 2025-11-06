import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import AgendamentoForm from '@/components/agendamentos/AgendamentoForm';
import AgendamentosList from '@/components/agendamentos/AgendamentosList';

export default function Agendamentos() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos de visitantes nas salas
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="finalizados">Finalizados</TabsTrigger>
          <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Agendamentos</CardTitle>
              <CardDescription>
                Lista completa de agendamentos no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgendamentosList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Pendentes</CardTitle>
              <CardDescription>
                Agendamentos aguardando confirmação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgendamentosList statusFilter={1} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="andamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos em Andamento</CardTitle>
              <CardDescription>
                Visitantes que já entraram e estão nas salas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgendamentosList statusFilter={3} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finalizados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Finalizados</CardTitle>
              <CardDescription>
                Agendamentos já realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgendamentosList statusFilter={4} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Cancelados</CardTitle>
              <CardDescription>
                Agendamentos que foram cancelados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgendamentosList statusFilter={5} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <AgendamentoForm 
          key={`agendamento-form-${Date.now()}`}
          open={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
