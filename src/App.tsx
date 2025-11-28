import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { GerenteRoute } from "./components/GerenteRoute";
import Index from "./pages/Index";
import Barbers from "./pages/Barbers";
import Clients from "./pages/Clients";
import Appointments from "./pages/Appointments";
import Revenue from "./pages/Revenue";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Plans from "./pages/Plans";
import Payments from "./pages/Payments";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          {/* Rotas acessíveis para todos os usuários autenticados */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/agendamentos" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/produtos" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Rotas exclusivas para Gerentes */}
          <Route path="/barbeiros" element={<ProtectedRoute><GerenteRoute><Barbers /></GerenteRoute></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><GerenteRoute><Schedule /></GerenteRoute></ProtectedRoute>} />
          <Route path="/faturamento" element={<ProtectedRoute><GerenteRoute><Revenue /></GerenteRoute></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><GerenteRoute><Reports /></GerenteRoute></ProtectedRoute>} />
          <Route path="/planos" element={<ProtectedRoute><GerenteRoute><Plans /></GerenteRoute></ProtectedRoute>} />
          <Route path="/pagamentos" element={<ProtectedRoute><GerenteRoute><Payments /></GerenteRoute></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
