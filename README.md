# Meu Piscineiro

Um assistente digital completo para profissionais de manutenção de piscinas.

## 🚀 Características

- **Dashboard Inteligente**: Visualize automaticamente os clientes do dia atual
- **Gestão de Clientes**: Organize sua base de clientes por dias da semana
- **Registro de Visitas**: Sistema completo de check-in/check-out com medição de parâmetros
- **Catálogo de Produtos**: Gerencie produtos químicos e suprimentos
- **Histórico Técnico**: Mantenha registro completo de cada visita e aplicação

## 📊 Setup do Banco de Dados

Execute o seguinte script SQL no Supabase SQL Editor:

```sql
-- Tabela para armazenar os clientes do profissional
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    dia_semana_visita INT NOT NULL, -- (1: Domingo, 2: Segunda, ..., 7: Sábado)
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para o catálogo de produtos químicos e outros itens
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome_produto VARCHAR(255) NOT NULL,
    unidade_medida VARCHAR(50) NOT NULL, -- ex: 'kg', 'L', 'un'
    is_padrao BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela principal que registra cada visita a um cliente
CREATE TABLE visitas (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    data_visita DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente', -- 'Pendente', 'Em andamento', 'Concluída'
    param_ph DECIMAL(4, 2),
    param_cloro DECIMAL(4, 2),
    param_alcalinidade DECIMAL(10, 2),
    param_dureza_calcica DECIMAL(10, 2),
    param_acido_cianurico DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de associação para registrar os produtos aplicados em uma visita
CREATE TABLE visita_produtos_aplicados (
    id SERIAL PRIMARY KEY,
    id_visita INTEGER NOT NULL REFERENCES visitas(id) ON DELETE CASCADE,
    id_produto INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade_aplicada DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para a lista de produtos que o cliente precisa comprar
CREATE TABLE visita_necessidades_cliente (
    id SERIAL PRIMARY KEY,
    id_visita INTEGER NOT NULL REFERENCES visitas(id) ON DELETE CASCADE,
    id_produto INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade_sugerida DECIMAL(10, 2) NOT NULL,
    status_aprovacao VARCHAR(50) NOT NULL DEFAULT 'Aguardando Aprovação', -- 'Aguardando Aprovação', 'Aprovado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir alguns produtos padrão
INSERT INTO produtos (nome_produto, unidade_medida, is_padrao) VALUES
('Cloro Granulado', 'kg', true),
('Redutor de pH', 'kg', true),
('Elevador de pH', 'kg', true),
('Algicida', 'L', true),
('Clarificante', 'L', true),
('Sulfato de Alumínio', 'kg', true),
('Barrilha', 'kg', true),
('Ácido Muriático', 'L', true),
('Estabilizante', 'kg', true),
('Anti-espuma', 'L', true);

-- Índices para melhor performance
CREATE INDEX idx_clientes_dia_visita ON clientes(dia_semana_visita);
CREATE INDEX idx_visitas_cliente_data ON visitas(id_cliente, data_visita);
CREATE INDEX idx_visitas_status ON visitas(status);
```

## 📱 Como Usar

1. **Dashboard**: Veja automaticamente os clientes do dia
2. **Clientes**: Gerencie sua base de clientes
3. **Produtos**: Mantenha catálogo de produtos químicos
4. **Visitas**: Registre check-in/out, parâmetros e produtos aplicados

---

**Meu Piscineiro** - Transformando a manutenção de piscinas em um processo digital! 🏊‍♂️