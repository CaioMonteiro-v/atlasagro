# Atlas Agro

Sistema web para substituir o controle manual (hoje feito por WhatsApp) de plantações e do manejo sanitário dos animais. Registre eventos com data, talhão ou lote e tipo de ação, e gere relatórios filtráveis.

## O que o sistema faz

- **Fazendas:** depois do login, cadastre a propriedade. Dá para ter várias e trocar no menu.
- **Talhões e plantios:** cadastro das áreas, culturas plantadas e eventos (adubação, defensivo, irrigação, colheita).
- **Lotes e sanidade:** cadastro dos grupos de animais e eventos sanitários (vacina, vermífugo, tratamento). Na vacina, informe o intervalo em dias para calcular a próxima aplicação.
- **Dashboard:** totais, alertas dos próximos 15 dias e últimos eventos.
- **Relatórios:** filtros por data, talhão, lote e tipo, com exportação CSV.
- **Alertas:** próximas aplicações sanitárias nos próximos 30 dias.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Client SDK)
- Recharts no dashboard

## 1. Criar o projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta (se ainda não tiver).
2. Clique em **New project**, escolha organização, nome (ex.: `atlasagro`) e senha do banco.
3. Aguarde o projeto ficar pronto.
4. Copie as credenciais (Project Settings → API, ou a tela **Set environment variables**):
   - **Project URL** / `SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - **publishable key** (`sb_publishable_...`) ou a chave **anon** antiga → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Não use a **secret key** (`sb_secret_...`) neste app.

## 2. Rodar o schema do banco

1. No painel do Supabase, abra **SQL Editor**.
2. Clique em **New query**.
3. Cole o conteúdo do arquivo `supabase/schema.sql`.
4. Clique em **Run**.

Isso cria as tabelas `fazendas`, `fazenda_membros`, `talhoes`, `plantios`, `eventos_plantio`, `lotes` e `eventos_sanitarios`, com chaves estrangeiras e RLS por fazenda (cada usuário só vê as propriedades das quais participa).

Se você já tinha rodado um schema antigo, rode este arquivo de novo: ele adiciona as fazendas e liga os talhões/lotes que já existirem.

## 3. Configurar autenticação (importante para criar conta)

1. No Supabase, vá em **Authentication → Providers** e deixe **Email** habilitado.
2. Em **Authentication → Providers → Email**, **desmarque Confirm email**.
   - Projetos novos vêm com isso ligado. A conta é criada, mas o app não consegue entrar e parece que “não deu certo”.
3. Salve. Depois disso, **Criar conta** já entra no sistema. O próximo passo é **cadastrar a fazenda**.

O login fica em `/login` (e-mail e senha). O middleware protege as demais rotas. A confirmação de e-mail, se for usada depois, volta em `/auth/callback`.

## 4. Preencher o `.env.local`

Na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Não versione o `.env.local` (ele já está no `.gitignore`).

## 5. Rodar o projeto localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Você será direcionado para `/login`. Crie a primeira conta ou entre com um usuário já existente.

## 6. Subir no Render

O app usa Server Actions, middleware e páginas no servidor. No Render isso é **Web Service** (Node), não Static Site.

1. Faça merge deste código na branch que o Render vai usar (em geral `main`).
2. Em [https://dashboard.render.com](https://dashboard.render.com), clique em **New → Web Service**.
3. Conecte o repositório `atlasagro` no GitHub.
4. Configure:
   - **Language / Runtime:** Node
   - **Branch:** `main` (ou a branch deste PR, se ainda não tiver feito merge)
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start -- -p $PORT`
5. Em **Environment**, adicione **antes do primeiro deploy** (o Next.js grava as variáveis `NEXT_PUBLIC_*` no build):

   | Chave | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto no Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable key (`sb_publishable_...`) |
   | `NEXT_PUBLIC_SITE_URL` | URL do Render, ex. `https://seu-servico.onrender.com` |

6. Clique em **Create Web Service** e espere o build terminar. A URL fica no formato `https://atlasagro.onrender.com`.
7. No Supabase, em **Authentication → URL Configuration**:
   - **Site URL:** a URL do Render (`https://seu-servico.onrender.com`)
   - **Redirect URLs:** `https://seu-servico.onrender.com/**` e `https://seu-servico.onrender.com/auth/callback`
8. Confirme que **Confirm email** está desmarcado, senão o cadastro no ar não entra.

No plano Free o serviço dorme depois de um tempo parado; o primeiro acesso seguinte pode demorar alguns segundos.

Há também um `render.yaml` na raiz, se quiser criar o serviço por Blueprint (**New → Blueprint**). As duas variáveis do Supabase ainda precisam ser preenchidas no painel (`sync: false`).

## Páginas

| Rota | Função |
| --- | --- |
| `/login` | Entrar ou criar conta |
| `/fazendas/nova` | Cadastro da fazenda (primeiro passo após o login) |
| `/fazendas` | Lista e troca de fazendas |
| `/` | Dashboard |
| `/talhoes` | Lista e cadastro de talhões |
| `/talhoes/[id]` | Detalhe do talhão e plantios |
| `/plantios/[id]` | Detalhe do plantio e eventos |
| `/lotes` | Lista e cadastro de lotes |
| `/lotes/[id]` | Detalhe do lote e eventos sanitários |
| `/relatorios` | Filtros e exportação CSV |
| `/alertas` | Próximas aplicações (30 dias) |

## Observações

- Os formulários usam **Server Actions** do Next.js com o cliente Supabase no servidor.
- A política de RLS é propositalmente simples (qualquer usuário autenticado acessa os dados). Dá para refinar depois por usuário ou propriedade, quando houver mais de uma fazenda.
- Em vacinas, o campo **Repetir em (dias)** calcula automaticamente `proxima_aplicacao`.
