import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Package } from 'lucide-react';
import { DatabaseService } from '@/lib/supabase';
import { Produto } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    nome_produto: '',
    unidade_medida: ''
  });

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getProdutos();
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar os produtos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_produto || !formData.unidade_medida) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos',
        variant: 'destructive'
      });
      return;
    }

    try {
      const produtoData = {
        ...formData,
        is_padrao: false
      };

      await DatabaseService.createProduto(produtoData);
      toast({
        title: 'Sucesso',
        description: 'Produto criado com sucesso'
      });

      setDialogOpen(false);
      resetForm();
      loadProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar o produto',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome_produto: '',
      unidade_medida: ''
    });
    setEditingProduto(null);
  };

  const handleNewProduto = () => {
    resetForm();
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewProduto}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome_produto">Nome do Produto *</Label>
                <Input
                  id="nome_produto"
                  value={formData.nome_produto}
                  onChange={(e) => setFormData({...formData, nome_produto: e.target.value})}
                  placeholder="Ex: Cloro Granulado"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="unidade_medida">Unidade de Medida *</Label>
                <Input
                  id="unidade_medida"
                  value={formData.unidade_medida}
                  onChange={(e) => setFormData({...formData, unidade_medida: e.target.value})}
                  placeholder="Ex: kg, L, un"
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Criar Produto
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

      {produtos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground text-center">
              Adicione produtos para usar nas visitas e recomendações aos clientes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtos.map((produto) => (
            <Card key={produto.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">
                    {produto.nome_produto}
                  </CardTitle>
                  {produto.is_padrao && (
                    <Badge variant="secondary">Padrão</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <strong>Unidade:</strong> {produto.unidade_medida}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}