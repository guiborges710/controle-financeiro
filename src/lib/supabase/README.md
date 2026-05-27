Supabase config — uso e instruções rápidas

O que é
- Arquivo de referência com as variáveis de ambiente necessárias para o Supabase.

Variáveis (preencha em `.env.local` ou no Vercel Project Settings)
- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase (ex: https://xyz.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave pública (anon)
- `SUPABASE_URL` — mesma URL (opcional, usada por helpers server-side)
- `SUPABASE_ANON_KEY` — mesma anon key (opcional)
- `SUPABASE_SERVICE_ROLE_KEY` — chave de serviço (NUNCA comitar; usar apenas em ambiente server protegido)

Local
1. Copie `env.example` para `.env.local` na raiz do projeto.
2. Preencha os valores.
3. Rode em modo dev:

```bash
npm install
npm run dev
```

Vercel
- Adicione as mesmas variáveis em Project → Settings → Environment Variables.
- Use `Production` para a branch `master` (deploy automático).
- Em Supabase > Authentication > Settings > Redirect URLs adicione seu domínio Vercel e `http://localhost:3000`.

Segurança
- Nunca comite chaves privadas (`SUPABASE_SERVICE_ROLE_KEY`).
- Para rotas server-side que precisam de permissões extras, use `SUPABASE_SERVICE_ROLE_KEY` apenas em Vercel env vars e nunca no client.

Ajuda
- Posso validar as variáveis no seu projeto (verificando `process.env` no build) ou checar logs do deploy se você fornecer a URL do Vercel.
