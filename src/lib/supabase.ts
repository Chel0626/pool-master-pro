import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service functions
export class DatabaseService {
  
  // Clientes
  static async getClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome_completo');
    
    if (error) throw error;
    return data;
  }

  static async getClientesPorDia(diaSemana: number) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('dia_semana_visita', diaSemana)
      .order('nome_completo');
    
    if (error) throw error;
    return data;
  }

  static async createCliente(cliente: Omit<import('../types').Cliente, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCliente(id: number, cliente: Partial<import('../types').Cliente>) {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Produtos
  static async getProdutos() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome_produto');
    
    if (error) throw error;
    return data;
  }

  static async createProduto(produto: Omit<import('../types').Produto, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('produtos')
      .insert([produto])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Visitas
  static async getVisitasPorClienteEData(idCliente: number, dataVisita: string) {
    const { data, error } = await supabase
      .from('visitas')
      .select('*')
      .eq('id_cliente', idCliente)
      .eq('data_visita', dataVisita);
    
    if (error) throw error;
    return data;
  }

  static async createVisita(visita: Omit<import('../types').Visita, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('visitas')
      .insert([visita])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateVisita(id: number, visita: Partial<import('../types').Visita>) {
    const { data, error } = await supabase
      .from('visitas')
      .update(visita)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Produtos aplicados
  static async getProdutosAplicados(idVisita: number) {
    const { data, error } = await supabase
      .from('visita_produtos_aplicados')
      .select(`
        *,
        produto:produtos(*)
      `)
      .eq('id_visita', idVisita);
    
    if (error) throw error;
    return data;
  }

  static async addProdutoAplicado(produtoAplicado: Omit<import('../types').VisitaProdutoAplicado, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('visita_produtos_aplicados')
      .insert([produtoAplicado])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Necessidades do cliente
  static async getNecessidadesCliente(idVisita: number) {
    const { data, error } = await supabase
      .from('visita_necessidades_cliente')
      .select(`
        *,
        produto:produtos(*)
      `)
      .eq('id_visita', idVisita);
    
    if (error) throw error;
    return data;
  }

  static async addNecessidadeCliente(necessidade: Omit<import('../types').VisitaNecessidadeCliente, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('visita_necessidades_cliente')
      .insert([necessidade])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}