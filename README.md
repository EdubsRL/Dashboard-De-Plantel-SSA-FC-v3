# SSA FC — Dashboard de Plantel

Sistema web para gestão de plantéis de futebol, desenvolvido com React, Vite e Supabase.

## Versão definitiva
- Acesso sem login.
- Interface preta com identidade laranja SSA FC.
- Logo SSA FC na navegação e no Dashboard.
- Gestão de múltiplos plantéis/categorias.
- Cadastro e edição de atletas.
- Situação: No clube, Em avaliação e Lesionado.
- Inscrito / Não inscrito.
- Posições principais e secundárias.
- Fotos e links de documentos.
- Filtros, ordenação e busca.
- Importação/exportação Excel.
- Escalações com formações e reservas por posição.
- Interface adaptada para celular.
- Relatórios e profundidade do elenco.

## Banco existente
Se você já possui dados no Supabase, **não rode o schema.sql por cima do banco de produção**. Use `migrations/004_definitive_no_login.sql`, que foi preparado para complementar a estrutura sem apagar os registros existentes.

## Configuração
Crie `.env` a partir de `.env.example` e informe:

`VITE_SUPABASE_URL=...`

`VITE_SUPABASE_ANON_KEY=...`

Depois:

```bash
npm install
npm run dev
```

Para validar a produção:

```bash
npm run build
```


## Cadastro de atletas
Na criação/edição, apenas **nome** e **data de nascimento** são obrigatórios. A data é digitada no formato **DD/MM/AAAA** e convertida automaticamente para o formato do Supabase. Os demais campos são opcionais e possuem valores padrão.
