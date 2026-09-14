# CRUD de arquivos com PHP

Backend simples em PHP para criar, listar, ler, atualizar e excluir arquivos dentro da pasta `server/files`.

A API usa HTTP e JSON, portanto pode ser consumida por um frontend em HTML, CSS e JavaScript.

## Requisitos

- PHP 8.1 ou superior
- Navegador ou ferramenta como `curl`

Para verificar a versao instalada:

```bash
php -v
```

## Estrutura do projeto

```text
.
├── README.md
├── files/
└── server/
    ├── config.php
    ├── file_service.php
    ├── files/
    ├── http.php
    └── index.php
```

A pasta usada pela API e `server/files/`. A pasta `files/` que aparece na raiz pode ser ignorada caso nao esteja sendo usada pelo backend.

## Como executar

Na raiz do projeto, execute:

```bash
php -S 127.0.0.1:8080 -t server server/index.php
```

A API ficara disponivel em:

```text
http://127.0.0.1:8080
```

Deixe esse comando rodando enquanto usa o frontend.

## Rotas da API

| Metodo | Rota | Funcao |
|---|---|---|
| `GET` | `/files` | Lista todos os arquivos |
| `GET` | `/files/{nome}` | Le o conteudo de um arquivo |
| `POST` | `/files` | Cria um arquivo |
| `PUT` | `/files/{nome}` | Atualiza um arquivo existente |
| `DELETE` | `/files/{nome}` | Exclui um arquivo |

Os nomes dos arquivos nao podem conter caminhos com `/`.

## Exemplos com curl

### Listar arquivos

```bash
curl http://127.0.0.1:8080/files
```

Resposta:

```json
[
  {"name":"exemplo.txt"}
]
```

### Criar arquivo

```bash
curl -X POST http://127.0.0.1:8080/files \
  -H "Content-Type: application/json" \
  -d '{"name":"exemplo.txt","content":"Meu primeiro arquivo"}'
```

### Ler arquivo

```bash
curl http://127.0.0.1:8080/files/exemplo.txt
```

### Atualizar arquivo

```bash
curl -X PUT http://127.0.0.1:8080/files/exemplo.txt \
  -H "Content-Type: application/json" \
  -d '{"content":"Conteudo atualizado"}'
```

### Excluir arquivo

```bash
curl -X DELETE http://127.0.0.1:8080/files/exemplo.txt
```

## Usando no frontend

Exemplo para listar os arquivos:

```javascript
const API_URL = "http://127.0.0.1:8080";

async function listarArquivos() {
  const resposta = await fetch(`${API_URL}/files`);
  const arquivos = await resposta.json();
  console.log(arquivos);
}
```

Exemplo para criar um arquivo:

```javascript
async function criarArquivo(nome, conteudo) {
  const resposta = await fetch(`${API_URL}/files`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: nome,
      content: conteudo
    })
  });

  return await resposta.json();
}
```

Exemplo para atualizar:

```javascript
async function atualizarArquivo(nome, conteudo) {
  const resposta = await fetch(`${API_URL}/files/${encodeURIComponent(nome)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content: conteudo })
  });

  return await resposta.json();
}
```

Exemplo para excluir:

```javascript
async function excluirArquivo(nome) {
  const resposta = await fetch(`${API_URL}/files/${encodeURIComponent(nome)}`, {
    method: "DELETE"
  });

  return await resposta.json();
}
```

## Respostas de erro

Os erros retornam JSON neste formato:

```json
{
  "error": "Arquivo nao encontrado."
}
```

Codigos mais comuns:

- `201`: arquivo criado
- `200`: operacao realizada com sucesso
- `204`: requisicao `OPTIONS` do navegador
- `400`: dados invalidos
- `404`: arquivo ou rota nao encontrada
- `409`: arquivo ja existe
- `405`: metodo HTTP nao permitido
- `500`: erro interno ao acessar o arquivo

## Observacoes

- O backend permite CORS para facilitar a comunicacao com o frontend.
- O conteudo enviado deve ser JSON.
- Nao e necessario banco de dados: os dados ficam como arquivos dentro de `server/files/`.
- Para parar o servidor, pressione `Ctrl + C` no terminal.
