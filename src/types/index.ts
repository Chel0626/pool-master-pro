// Types for Meu Piscineiro App

export interface Cliente {
  id: number;
  nome_completo: string;
  endereco: string;
  telefone: string;
  dia_semana_visita: number; // 1-7 (Domingo-Sábado)
  observacoes?: string;
  created_at: string;
}

export interface Produto {
  id: number;
  nome_produto: string;
  unidade_medida: string;
  is_padrao: boolean;
  created_at: string;
}

export type VisitaStatus = 'Pendente' | 'Em andamento' | 'Concluída';

export interface Visita {
  id: number;
  id_cliente: number;
  data_visita: string;
  hora_inicio?: string;
  hora_fim?: string;
  status: VisitaStatus;
  param_ph?: number;
  param_cloro?: number;
  param_alcalinidade?: number;
  param_dureza_calcica?: number;
  param_acido_cianurico?: number;
  created_at: string;
  cliente?: Cliente;
}

export interface VisitaProdutoAplicado {
  id: number;
  id_visita: number;
  id_produto: number;
  quantidade_aplicada: number;
  created_at: string;
  produto?: Produto;
}

export type StatusAprovacao = 'Aguardando Aprovação' | 'Aprovado';

export interface VisitaNecessidadeCliente {
  id: number;
  id_visita: number;
  id_produto: number;
  quantidade_sugerida: number;
  status_aprovacao: StatusAprovacao;
  created_at: string;
  produto?: Produto;
}

export const DIAS_SEMANA = [
  { value: 1, label: 'Domingo' },
  { value: 2, label: 'Segunda-feira' },
  { value: 3, label: 'Terça-feira' },
  { value: 4, label: 'Quarta-feira' },
  { value: 5, label: 'Quinta-feira' },
  { value: 6, label: 'Sexta-feira' },
  { value: 7, label: 'Sábado' }
];

export const getDiaSemanaLabel = (dia: number): string => {
  return DIAS_SEMANA.find(d => d.value === dia)?.label || 'Dia inválido';
};

export const getDiaAtual = (): number => {
  // JavaScript: 0=Domingo, 1=Segunda... Convertendo para 1=Domingo, 2=Segunda...
  return new Date().getDay() + 1;
};