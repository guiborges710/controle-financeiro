# Controle Financeiro

SaaS de controle financeiro com dois **universos**:

| Universo | Rota | O que registra |
|----------|------|----------------|
| **Pessoal** | `/pessoal` | Receitas e despesas do dia a dia |
| **Empresa** | `/empresa` | Faturamento e custos (MVP: **Delivery**) |

## Começar agora (modo local — sem Supabase)

Por padrão o projeto roda em **modo local**. Não precisa criar conta no Supabase.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) e clique em **Experimentar agora** ou **Entrar e testar o sistema**.

- Os dados ficam em `data/store.json` (criado automaticamente na primeira execução)
- Já vêm **lançamentos de exemplo** (pessoal + delivery)
- Você pode adicionar, listar e excluir transações normalmente
- Use **Restaurar dados de exemplo** no banner azul para resetar o demo

## Modo Supabase (quando for avançar)

1. No `.env.local`, defina:

```env
DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

2. Execute `supabase/migrations/001_initial_schema.sql` no SQL Editor do Supabase.
3. Habilite autenticação por e-mail/senha.

## Delivery (empresa)

Faturamento por linha: doces, macarrão, sopa, outros salgados. Cálculos de margem e resultado líquido no painel `/empresa`.

Futuramente: formulário para escolher o ramo e configs por ramo (hoje só `delivery`).

## Stack

- Next.js 16 + TypeScript + Tailwind
- Modo local: JSON em disco
- Modo supabase: Auth + PostgreSQL
