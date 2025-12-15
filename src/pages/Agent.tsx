import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bot, QrCode, Wifi, WifiOff, RefreshCw, Power, PowerOff } from "lucide-react";

export default function Agent() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Buscar configurações do agente
  const { data: agentSettings, isLoading } = useQuery({
    queryKey: ["agent-settings", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("agent_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Criar ou atualizar configurações
  const upsertSettings = useMutation({
    mutationFn: async (updates: Partial<{
      is_active: boolean;
      instance_id: string;
      instance_name: string;
      qr_code: string;
      connection_status: string;
      connected_at: string | null;
    }>) => {
      if (!userId) throw new Error("Usuário não autenticado");

      if (agentSettings) {
        const { error } = await supabase
          .from("agent_settings")
          .update(updates)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("agent_settings")
          .insert({ user_id: userId, ...updates });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-settings", userId] });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar configurações: " + error.message);
    },
  });

  // Alternar status do agente
  const handleToggleAgent = async (checked: boolean) => {
    await upsertSettings.mutateAsync({ is_active: checked });
    toast.success(checked ? "Agente ativado" : "Agente desativado");
  };

  // Gerar QR Code (simulação - em produção, integraria com API do WhatsApp)
  const handleGenerateQR = async () => {
    // Simulação de geração de QR Code
    const mockInstanceId = `instance_${Date.now()}`;
    const mockQRCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${mockInstanceId}`;
    
    await upsertSettings.mutateAsync({
      instance_id: mockInstanceId,
      qr_code: mockQRCode,
      connection_status: "awaiting_scan",
    });
    
    toast.success("QR Code gerado com sucesso!");
  };

  // Simular conexão (em produção, seria um webhook)
  const handleSimulateConnect = async () => {
    await upsertSettings.mutateAsync({
      connection_status: "connected",
      connected_at: new Date().toISOString(),
      instance_name: "WhatsApp Business",
    });
    toast.success("Instância conectada!");
  };

  // Desconectar instância
  const handleDisconnect = async () => {
    await upsertSettings.mutateAsync({
      connection_status: "disconnected",
      connected_at: null,
      qr_code: null,
      instance_id: null,
      instance_name: null,
    });
    toast.success("Instância desconectada!");
  };

  const isConnected = agentSettings?.connection_status === "connected";
  const isAwaitingScan = agentSettings?.connection_status === "awaiting_scan";

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 sm:p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Agente de Atendimento</h1>
            <p className="text-muted-foreground">Gerencie seu agente de atendimento automático</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Status do Agente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {agentSettings?.is_active ? (
                  <Power className="h-5 w-5 text-green-500" />
                ) : (
                  <PowerOff className="h-5 w-5 text-muted-foreground" />
                )}
                Status do Agente
              </CardTitle>
              <CardDescription>
                Ative ou desative o agente de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="agent-toggle">Agente Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    {agentSettings?.is_active 
                      ? "O agente está respondendo mensagens" 
                      : "O agente está pausado"}
                  </p>
                </div>
                <Switch
                  id="agent-toggle"
                  checked={agentSettings?.is_active || false}
                  onCheckedChange={handleToggleAgent}
                  disabled={upsertSettings.isPending}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status da Conexão</span>
                  <Badge 
                    variant={isConnected ? "default" : "secondary"}
                    className={isConnected ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {isConnected ? (
                      <><Wifi className="h-3 w-3 mr-1" /> Conectado</>
                    ) : isAwaitingScan ? (
                      <><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Aguardando Scan</>
                    ) : (
                      <><WifiOff className="h-3 w-3 mr-1" /> Desconectado</>
                    )}
                  </Badge>
                </div>

                {agentSettings?.instance_name && isConnected && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Instância: {agentSettings.instance_name}
                  </p>
                )}

                {agentSettings?.connected_at && isConnected && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Conectado em: {new Date(agentSettings.connected_at).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conexão WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Conexão WhatsApp
              </CardTitle>
              <CardDescription>
                Conecte sua instância do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-8 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-center">
                      <Wifi className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-green-700 dark:text-green-400">
                        WhatsApp Conectado
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sua instância está ativa e recebendo mensagens
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleDisconnect}
                    disabled={upsertSettings.isPending}
                  >
                    <WifiOff className="h-4 w-4 mr-2" />
                    Desconectar Instância
                  </Button>
                </div>
              ) : isAwaitingScan && agentSettings?.qr_code ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      Escaneie o QR Code com seu WhatsApp
                    </p>
                    <img 
                      src={agentSettings.qr_code} 
                      alt="QR Code" 
                      className="w-48 h-48 rounded-lg border"
                    />
                    <p className="text-xs text-muted-foreground mt-4">
                      Abra o WhatsApp → Menu → Dispositivos Conectados → Conectar
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleGenerateQR}
                      disabled={upsertSettings.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Novo QR
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleSimulateConnect}
                      disabled={upsertSettings.isPending}
                    >
                      <Wifi className="h-4 w-4 mr-2" />
                      Simular Conexão
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Gere um QR Code para conectar seu WhatsApp
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handleGenerateQR}
                    disabled={upsertSettings.isPending}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Gerar QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
