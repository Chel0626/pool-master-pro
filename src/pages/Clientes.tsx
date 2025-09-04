import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Phone, MapPin, Calendar, Users } from 'lucide-react';
import { DatabaseService } from '@/lib/supabase';
import { Cliente, DIAS_SEMANA, getDiaSemanaLabel } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome_completo: '',
    endereco: '',
    telefone: '',
    dia_semana_visita: '',
    observacoes: ''
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getClientes();
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar os clientes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo || !formData.endereco || !formData.telefone || !formData.dia_semana_visita) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      const clienteData = {
        ...formData,
        dia_semana_visita: parseInt(formData.dia_semana_visita)
      };

      if (editingCliente) {
        await DatabaseService.updateCliente(editingCliente.id, clienteData);
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso'
        });
      } else {
        await DatabaseService.createCliente(clienteData);
        toast({
          title: 'Sucesso',
          description: 'Cliente criado com sucesso'
        });
      }

      setDialogOpen(false);
      resetForm();
      loadClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar o cliente',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      endereco: '',
      telefone: '',
      dia_semana_visita: '',
      observacoes: ''
    });
    setEditingCliente(null);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome_completo: cliente.nome_completo,
      endereco: cliente.endereco,
      telefone: cliente.telefone,
      dia_semana_visita: cliente.dia_semana_visita.toString(),
      observacoes: cliente.observacoes || ''
    });
    setDialogOpen(true);
  };

  const handleNewCliente = () => {
    resetForm();
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewCliente}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="endereco">Endereço *</Label>
                <Textarea
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  placeholder="Digite o endereço completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="dia_semana_visita">Dia da Visita *</Label>
                <Select 
                  value={formData.dia_semana_visita} 
                  onValueChange={(value) => setFormData({...formData, dia_semana_visita: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia da semana" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAS_SEMANA.map((dia) => (
                      <SelectItem key={dia.value} value={dia.value.toString()}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações sobre o cliente ou piscina"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCliente ? 'Atualizar' : 'Criar'} Cliente
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {clientes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-muted-foreground text-center">
              Comece criando seu primeiro cliente para organizar sua agenda.
            </p>
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
                  <Badge variant="outline">
                    {getDiaSemanaLabel(cliente.dia_semana_visita)}
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
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(cliente)}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}