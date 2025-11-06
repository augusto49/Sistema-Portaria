import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Agendamentos from "./pages/Agendamentos";
import Visitantes from "./pages/Visitantes";
import Salas from "./pages/Salas";
import Feriados from "./pages/Feriados";
import Historico from "./pages/Historico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/visitantes" element={<Visitantes />} />
            <Route path="/salas" element={<Salas />} />
            <Route path="/feriados" element={<Feriados />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
