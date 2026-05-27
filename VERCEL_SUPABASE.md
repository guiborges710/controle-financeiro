Configurar Supabase Auth para deploy no Vercel

Resumo
- Objetivo: fazer com que os logins via Supabase funcionem corretamente quando a aplicação estiver deployada no Vercel (deploy automático na branch `master`).

Passos essenciais

1) Variáveis de ambiente no Vercel
- Defina estas variáveis no dashboard do Vercel (Project Settings -> Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL` = <Supabase URL (ex: https://xyz.supabase.co)>
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = <Supabase anon public key>
  - `SUPABASE_URL` = mesma URL do projeto Supabase (opcional, fornecida às vezes por libs server)
  - `SUPABASE_ANON_KEY` = mesma anon key (opcional)

Observações:
- Use as _Environment_ apropriadas (`Production` para master).
- Nunca comite chaves privadas no código. Para rotinas de servidor mais privilegiadas, use `SUPABASE_SERVICE_ROLE_KEY` **só** quando estritamente necessário e mantenha em `Vercel -> Environment Variables` como `Environment Variable` protegido.

2) Configurar Redirect URLs no painel Supabase
- Em Supabase > Authentication > Settings > Redirect URLs adicione:
  - `https://your-vercel-app.vercel.app` (troque pelo domínio do seu projeto)
  - `http://localhost:3000` (para desenvolvimento)
- Em Site URL coloque `https://your-vercel-app.vercel.app`.

3) Habilitar sign-ups (se desejar criar contas)
- Supabase > Authentication > Settings > Allow new signups = ON

4) Conferir código (o que já existe neste repo)
- O projeto já tem integração com `@supabase/ssr`:
  - `src/lib/supabase/client.ts` (browser)
  - `src/lib/supabase/server.ts` (server)
  - `src/app/auth/signout/route.ts` (rota de logout server-side)
  - `src/components/auth/login-form.tsx` e `signup-form.tsx` (client-side)
  - `src/lib/auth/session.ts` e `src/lib/supabase/middleware.ts` (middleware para proteger rotas)

Isso significa que, após configurar as variáveis em Vercel e os Redirect URLs no Supabase, o fluxo de login/signup no client deverá funcionar sem mudanças de código.

5) Testar após deploy
- Faça um commit na `master` e aguarde o deploy no Vercel.
- Teste: criar conta, login, logout, e acessar rotas protegidas (`/empresa`).
- Em caso de problemas, abra a aba `Deploys` no Vercel e veja os logs de runtime; veja também a aba `Logs` no Supabase Auth.

Dicas de debugging
- Se o login acontece, mas o usuário não é mantido (SSR não detecta sessão), verifique se as cookies do Supabase estão sendo enviadas no domínio correto (secure, sameSite) e se `SUPABASE_URL`/keys correspondem ao projeto.
- Para callback OAuth (Google/GitHub), adicione os domains Vercel nas `Redirect URLs` e configure os providers no Supabase com as chaves corretas.

Próximos passos sugeridos
- Se quiser, eu posso: (a) adicionar um `README` curto na pasta `src/lib/supabase` com exemplos de variáveis; (b) automatizar um `env.example`; (c) verificar logs de erro específicos do deploy se você colar aqui a URL do projeto Vercel.

