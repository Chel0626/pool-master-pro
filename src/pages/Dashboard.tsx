import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Phone, Clock } from 'lucide-react';
import { DatabaseService } from '@/lib/supabase';
import { Cliente, Visita, getDiaAtual, getDiaSemanaLabel } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ClienteComVisita extends Cliente {
  visitaStatus?: 'Pendente' | 'Em andamento' | 'Concluída';
  visitaId?: number;
}

export default function Dashboard() {
  const [clientes, setClientes] = useState<ClienteComVisita[]>([]);
  const [loading, setLoading] = useState(true);
  const diaAtual = getDiaAtual();

  useEffect(() => {
    loadClientesDoDia();
  }, []);

  const loadClientesDoDia = async () => {
    try {
      setLoading(true);
      const clientesDoDia = await DatabaseService.getClientesPorDia(diaAtual);
      
      // Para cada cliente, verificar se já existe uma visita para hoje
      const clientesComStatus = await Promise.all(
        clientesDoDia.map(async (cliente) => {
          const hoje = new Date().toISOString().split('T')[0];
          const visitas = await DatabaseService.getVisitasPorClienteEData(cliente.id, hoje);
          
          let visitaStatus: 'Pendente' | 'Em andamento' | 'Concluída' = 'Pendente';
          let visitaId: number | undefined;
          
          if (visitas && visitas.length > 0) {
            const visita = visitas[0];
            visitaStatus = visita.status as any;
            visitaId = visita.id;
          }
          
          return {
            ...cliente,
            visitaStatus,
            visitaId
          };
        })
      );
      
      setClientes(clientesComStatus);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar os clientes do dia',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-green-500';
      case 'Em andamento':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard - Roteiro do Dia</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Roteiro de hoje - {getDiaSemanaLabel(diaAtual)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {clientes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma visita agendada</h3>
            <p className="text-muted-foreground text-center">
              Não há clientes agendados para {getDiaSemanaLabel(diaAtual)}.
            </p>
            <Button asChild className="mt-4">
              <Link to="/clientes">Gerenciar Clientes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">
                    {cliente.nome_completo}
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(cliente.visitaStatus!)} text-white`}
                  >
                    {cliente.visitaStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{cliente.endereco}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{cliente.telefone}</span>
                </div>

                {cliente.observacoes && (
                  <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                    <strong>Obs:</strong> {cliente.observacoes}
                  </div>
                )}

                <Button 
                  asChild 
                  className="w-full"
                >
                  <Link 
                    to={`/visita/${cliente.id}`}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    {cliente.visitaStatus === 'Pendente' ? 'Iniciar Visita' : 'Ver Visita'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}