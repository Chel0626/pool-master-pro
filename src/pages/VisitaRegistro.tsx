import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Square, Plus, Trash2, Send, Clock, TestTube, ShoppingCart } from 'lucide-react';
import { DatabaseService } from '@/lib/supabase';
import { Cliente, Visita, Produto, VisitaProdutoAplicado, VisitaNecessidadeCliente } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function VisitaRegistro() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [visita, setVisita] = useState<Visita | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosAplicados, setProdutosAplicados] = useState<VisitaProdutoAplicado[]>([]);
  const [necessidadesCliente, setNecessidadesCliente] = useState<VisitaNecessidadeCliente[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [parametros, setParametros] = useState({
    param_ph: '',
    param_cloro: '',
    param_alcalinidade: '',
    param_dureza_calcica: '',
    param_acido_cianurico: ''
  });
  
  const [novoProdutoAplicado, setNovoProdutoAplicado] = useState({
    id_produto: '',
    quantidade_aplicada: ''
  });
  
  const [novaNecessidade, setNovaNecessidade] = useState({
    id_produto: '',
    quantidade_sugerida: ''
  });

  useEffect(() => {
    if (clienteId) {
      loadDados();
    }
  }, [clienteId]);

  const loadDados = async () => {
    if (!clienteId) return;
    
    try {
      setLoading(true);
      
      // Carregar cliente
      const clientes = await DatabaseService.getClientes();
      const clienteEncontrado = clientes?.find(c => c.id === parseInt(clienteId));
      
      if (!clienteEncontrado) {
        toast({
          title: 'Erro',
          description: 'Cliente não encontrado',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }
      
      setCliente(clienteEncontrado);
      
      // Carregar produtos
      const produtosData = await DatabaseService.getProdutos();
      setProdutos(produtosData || []);
      
      // Verificar se já existe visita para hoje
      const hoje = new Date().toISOString().split('T')[0];
      const visitasHoje = await DatabaseService.getVisitasPorClienteEData(parseInt(clienteId), hoje);
      
      if (visitasHoje && visitasHoje.length > 0) {
        const visitaAtual = visitasHoje[0];
        setVisita(visitaAtual);
        
        // Carregar dados da visita
        setParametros({
          param_ph: visitaAtual.param_ph?.toString() || '',
          param_cloro: visitaAtual.param_cloro?.toString() || '',
          param_alcalinidade: visitaAtual.param_alcalinidade?.toString() || '',
          param_dureza_calcica: visitaAtual.param_dureza_calcica?.toString() || '',
          param_acido_cianurico: visitaAtual.param_acido_cianurico?.toString() || ''
        });
        
        // Carregar produtos aplicados e necessidades
        const produtosAplicadosData = await DatabaseService.getProdutosAplicados(visitaAtual.id);
        const necessidadesData = await DatabaseService.getNecessidadesCliente(visitaAtual.id);
        
        setProdutosAplicados(produtosAplicadosData || []);
        setNecessidadesCliente(necessidadesData || []);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar os dados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarVisita = async () => {
    if (!cliente) return;
    
    try {
      const agora = new Date();
      const visitaData = {
        id_cliente: cliente.id,
        data_visita: agora.toISOString().split('T')[0],
        hora_inicio: agora.toTimeString().split(' ')[0].substring(0, 5),
        status: 'Em andamento' as const
      };
      
      const novaVisita = await DatabaseService.createVisita(visitaData);
      setVisita(novaVisita);
      
      toast({
        title: 'Sucesso',
        description: 'Visita iniciada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao iniciar visita:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao iniciar a visita',
        variant: 'destructive'
      });
    }
  };

  const handleSalvarParametros = async () => {
    if (!visita) return;
    
    try {
      const parametrosNumericos = {
        param_ph: parametros.param_ph ? parseFloat(parametros.param_ph) : undefined,
        param_cloro: parametros.param_cloro ? parseFloat(parametros.param_cloro) : undefined,
        param_alcalinidade: parametros.param_alcalinidade ? parseFloat(parametros.param_alcalinidade) : undefined,
        param_dureza_calcica: parametros.param_dureza_calcica ? parseFloat(parametros.param_dureza_calcica) : undefined,
        param_acido_cianurico: parametros.param_acido_cianurico ? parseFloat(parametros.param_acido_cianurico) : undefined
      };
      
      await DatabaseService.updateVisita(visita.id, parametrosNumericos);
      
      toast({
        title: 'Sucesso',
        description: 'Parâmetros salvos com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar parâmetros:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar os parâmetros',
        variant: 'destructive'
      });
    }
  };

  const handleAdicionarProdutoAplicado = async () => {
    if (!visita || !novoProdutoAplicado.id_produto || !novoProdutoAplicado.quantidade_aplicada) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um produto e informe a quantidade',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const produtoAplicado = {
        id_visita: visita.id,
        id_produto: parseInt(novoProdutoAplicado.id_produto),
        quantidade_aplicada: parseFloat(novoProdutoAplicado.quantidade_aplicada)
      };
      
      await DatabaseService.addProdutoAplicado(produtoAplicado);
      
      // Recarregar produtos aplicados
      const produtosAplicadosData = await DatabaseService.getProdutosAplicados(visita.id);
      setProdutosAplicados(produtosAplicadosData || []);
      
      setNovoProdutoAplicado({ id_produto: '', quantidade_aplicada: '' });
      
      toast({
        title: 'Sucesso',
        description: 'Produto aplicado adicionado'
      });
    } catch (error) {
      console.error('Erro ao adicionar produto aplicado:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar o produto aplicado',
        variant: 'destructive'
      });
    }
  };

  const handleAdicionarNecessidade = async () => {
    if (!visita || !novaNecessidade.id_produto || !novaNecessidade.quantidade_sugerida) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um produto e informe a quantidade',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const necessidade = {
        id_visita: visita.id,
        id_produto: parseInt(novaNecessidade.id_produto),
        quantidade_sugerida: parseFloat(novaNecessidade.quantidade_sugerida),
        status_aprovacao: 'Aguardando Aprovação' as const
      };
      
      await DatabaseService.addNecessidadeCliente(necessidade);
      
      // Recarregar necessidades
      const necessidadesData = await DatabaseService.getNecessidadesCliente(visita.id);
      setNecessidadesCliente(necessidadesData || []);
      
      setNovaNecessidade({ id_produto: '', quantidade_sugerida: '' });
      
      toast({
        title: 'Sucesso',
        description: 'Necessidade do cliente adicionada'
      });
    } catch (error) {
      console.error('Erro ao adicionar necessidade:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar a necessidade do cliente',
        variant: 'destructive'
      });
    }
  };

  const handleFinalizarVisita = async () => {
    if (!visita) return;
    
    try {
      const agora = new Date();
      const visitaAtualizada = {
        hora_fim: agora.toTimeString().split(' ')[0].substring(0, 5),
        status: 'Concluída' as const
      };
      
      await DatabaseService.updateVisita(visita.id, visitaAtualizada);
      
      toast({
        title: 'Sucesso',
        description: 'Visita finalizada com sucesso'
      });
      
      navigate('/');
    } catch (error) {
      console.error('Erro ao finalizar visita:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao finalizar a visita',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Carregando...</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Cliente não encontrado</h1>
        <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{cliente.nome_completo}</h1>
          <p className="text-muted-foreground">{cliente.endereco}</p>
        </div>
        <div className="flex items-center gap-2">
          {visita && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {visita.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Check-in/Check-out */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Controle de Visita
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          {!visita ? (
            <Button onClick={handleIniciarVisita} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Iniciar Visita / Check-in
            </Button>
          ) : visita.status === 'Em andamento' ? (
            <div className="flex gap-2">
              <Button onClick={handleFinalizarVisita} className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Finalizar Visita / Check-out
              </Button>
              <Button 
                onClick={handleFinalizarVisita}
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Finalizar e Enviar para Cliente
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Visita finalizada às {visita.hora_fim}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parâmetros da Piscina */}
      {visita && visita.status === 'Em andamento' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Medição de Parâmetros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ph">pH</Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  value={parametros.param_ph}
                  onChange={(e) => setParametros({...parametros, param_ph: e.target.value})}
                  placeholder="7.2"
                />
              </div>
              <div>
                <Label htmlFor="cloro">Cloro (ppm)</Label>
                <Input
                  id="cloro"
                  type="number"
                  step="0.1"
                  value={parametros.param_cloro}
                  onChange={(e) => setParametros({...parametros, param_cloro: e.target.value})}
                  placeholder="1.5"
                />
              </div>
              <div>
                <Label htmlFor="alcalinidade">Alcalinidade (ppm)</Label>
                <Input
                  id="alcalinidade"
                  type="number"
                  step="1"
                  value={parametros.param_alcalinidade}
                  onChange={(e) => setParametros({...parametros, param_alcalinidade: e.target.value})}
                  placeholder="120"
                />
              </div>
              <div>
                <Label htmlFor="dureza">Dureza Cálcica (ppm)</Label>
                <Input
                  id="dureza"
                  type="number"
                  step="1"
                  value={parametros.param_dureza_calcica}
                  onChange={(e) => setParametros({...parametros, param_dureza_calcica: e.target.value})}
                  placeholder="200"
                />
              </div>
              <div>
                <Label htmlFor="cianurico">Ácido Cianúrico (ppm)</Label>
                <Input
                  id="cianurico"
                  type="number"
                  step="1"
                  value={parametros.param_acido_cianurico}
                  onChange={(e) => setParametros({...parametros, param_acido_cianurico: e.target.value})}
                  placeholder="50"
                />
              </div>
            </div>
            <Button onClick={handleSalvarParametros}>
              Salvar Parâmetros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Produtos Aplicados */}
      {visita && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos Aplicados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visita.status === 'Em andamento' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <Select 
                  value={novoProdutoAplicado.id_produto} 
                  onValueChange={(value) => setNovoProdutoAplicado({...novoProdutoAplicado, id_produto: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id.toString()}>
                        {produto.nome_produto} ({produto.unidade_medida})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Quantidade"
                  value={novoProdutoAplicado.quantidade_aplicada}
                  onChange={(e) => setNovoProdutoAplicado({...novoProdutoAplicado, quantidade_aplicada: e.target.value})}
                />
                <Button onClick={handleAdicionarProdutoAplicado}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              {produtosAplicados.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{item.produto?.nome_produto}</span>
                    <span className="text-muted-foreground ml-2">
                      {item.quantidade_aplicada} {item.produto?.unidade_medida}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Necessidades do Cliente */}
      {visita && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Lista de Necessidades para o Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visita.status === 'Em andamento' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <Select 
                  value={novaNecessidade.id_produto} 
                  onValueChange={(value) => setNovaNecessidade({...novaNecessidade, id_produto: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id.toString()}>
                        {produto.nome_produto} ({produto.unidade_medida})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Quantidade sugerida"
                  value={novaNecessidade.quantidade_sugerida}
                  onChange={(e) => setNovaNecessidade({...novaNecessidade, quantidade_sugerida: e.target.value})}
                />
                <Button onClick={handleAdicionarNecessidade}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              {necessidadesCliente.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{item.produto?.nome_produto}</span>
                    <span className="text-muted-foreground ml-2">
                      {item.quantidade_sugerida} {item.produto?.unidade_medida}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {item.status_aprovacao}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}