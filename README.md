# Atlas Agro

Sistema web para substituir o controle manual (hoje feito por WhatsApp) de plantações e do manejo sanitário dos animais. Registre eventos com data, talhão ou lote e tipo de ação, e gere relatórios filtráveis.

## O que o sistema faz

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
4. No menu **Project Settings → API**, copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Rodar o schema do banco

1. No painel do Supabase, abra **SQL Editor**.
2. Clique em **New query**.
3. Cole o conteúdo do arquivo `supabase/schema.sql`.
4. Clique em **Run**.

Isso cria as tabelas `talhoes`, `plantios`, `eventos_plantio`, `lotes` e `eventos_sanitarios`, com chaves estrangeiras e Row Level Security (usuários autenticados podem ler e escrever).

## 3. Configurar autenticação

1. No Supabase, vá em **Authentication → Providers** e deixe **Email** habilitado.
2. Em **Authentication → Providers → Email**, desmarque **Confirm email** enquanto testa localmente. Assim a conta criada em **Criar conta** já entra no sistema, sem precisar confirmar o e-mail.
3. Depois, se quiser, reative a confirmação de e-mail em produção.

O login fica em `/login` (e-mail e senha). O middleware protege as demais rotas.

## 4. Preencher o `.env.local`

Na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

Não versione o `.env.local` (ele já está no `.gitignore`).

## 5. Rodar o projeto localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Você será direcionado para `/login`. Crie a primeira conta ou entre com um usuário já existente.

## Páginas

| Rota | Função |
| --- | --- |
| `/login` | Entrar ou criar conta |
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
