# Simulador de DRE (ADM/Contabeis)

Projeto web simples em HTML, CSS e JavaScript para treino de classificacao de contas na DRE.

## Funcionalidades

- Entrada com nome do aluno.
- Geracao de lista de registros contabeis.
- Classificacao dos registros por categoria da DRE.
- Calculo automatico do resumo da DRE.
- Validacao da resposta com retorno de acerto/erro.
- Registro de tentativas em JSON no navegador (localStorage).
- Exportacao e importacao de tentativas em arquivo JSON editavel.

## Estrutura

- `index.html`: interface.
- `styles.css`: estilos.
- `app.js`: logica da aplicacao.
- `dados/registros-base.json`: base de exercicios (editavel).
- `dados/registros-tentativas.json`: modelo inicial vazio.

## Personalizacao dos exercicios

Edite o arquivo `dados/registros-base.json` para incluir novos cenarios de DRE.

Cada registro deve conter:

- `id`
- `conta`
- `valor`
- `categoriaCorreta`

Categorias atuais:

- Receita Bruta
- Deducoes
- CMV
- Despesas Operacionais
- Resultado Financeiro
- Impostos sobre Lucro

## Como rodar localmente

Como o projeto usa `fetch` para ler JSON, rode com um servidor local simples:

```bash
python3 -m http.server 5500
```

Depois abra: `http://localhost:5500`

## Publicar no GitHub Pages

1. Crie um repositorio no GitHub.
2. Suba os arquivos deste projeto.
3. Em **Settings > Pages**, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main` (root)
4. Salve e aguarde o link publico.

Pronto: os alunos poderao acessar pelo link do GitHub Pages.
