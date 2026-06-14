# Controle Financeiro

SaaS de controle financeiro com dois universos:

| Universo | Rota | O que registra |
|----------|------|----------------|
| Pessoal | `/pessoal` | Receitas e despesas do dia a dia |
| Empresa | `/empresa` | Faturamento e custos |

## Modo mock local

Por padrão, o projeto roda em `mock`: os dados ficam em `data/store.json` e
nenhuma chamada é feita ao Supabase.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` e use o login local.

Para forçar pelo código, edite:

```ts
// src/lib/config/mode.ts
export const CODE_DATA_MODE = "mock";
```

## Produção

Para usar Supabase, troque para `production`:

```ts
// src/lib/config/mode.ts
export const CODE_DATA_MODE = "production";
```

Ou defina no ambiente:

```env
DATA_MODE=production
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

Execute as migrations em `supabase/migrations/` no banco de produção.

## Stack

- Next.js 16 + TypeScript + Tailwind
- Mock local: JSON em disco
- Produção: Supabase Auth + PostgreSQL
