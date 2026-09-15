const API_URL = 'http://127.0.0.1:8080';

const listaArquivos = document.getElementById('lista-arquivos');
const inputNome = document.getElementById('nome-arquivo');
const inputConteudo = document.getElementById('conteudo-arquivo');
const btnSalvar = document.getElementById('btn-salvar');
const btnExcluir = document.getElementById('btn-excluir');
const btnNovo = document.getElementById('btn-novo');
const statusModo = document.getElementById('status-modo');

let arquivoSelecionado = null;

// Carregar lista de arquivos
async function carregarArquivos() {
  try {
    const resposta = await fetch(`${API_URL}/files`);
    const arquivos = await resposta.json();
    
    listaArquivos.innerHTML = '';
    
    arquivos.forEach(arq => {
      const li = document.createElement('li');
      li.textContent = arq.name;
      li.onclick = () => abrirArquivo(arq.name);
      listaArquivos.appendChild(li);
    });
  } catch (erro) {
    alert('Erro ao conectar com o servidor!');
  }
}

// Ler conteudo de um arquivo
async function abrirArquivo(nome) {
  try {
    const resposta = await fetch(`${API_URL}/files/${nome}`);
    const conteudo = await resposta.text();
    
    arquivoSelecionado = nome;
    inputNome.value = nome;
    inputNome.disabled = true;
    inputConteudo.value = conteudo;
    
    statusModo.textContent = 'Modo: Editando';
    btnExcluir.style.display = 'inline-block';
  } catch (erro) {
    alert('Erro ao abrir o arquivo!');
  }
}

// Salvar (Criar ou Editar)
async function salvarArquivo() {
  const nome = inputNome.value;
  const conteudo = inputConteudo.value;

  if (nome === '') {
    alert('Digite o nome do arquivo!');
    return;
  }

  try {
    if (arquivoSelecionado) {
      // Editar (PUT)
      await fetch(`${API_URL}/files/${arquivoSelecionado}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: conteudo })
      });
    } else {
      // Criar (POST)
      await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, content: conteudo })
      });
    }

    limparFormulario();
    carregarArquivos();
  } catch (erro) {
    alert('Erro ao salvar!');
  }
}

// Excluir Arquivo
async function excluirArquivo() {
  if (!arquivoSelecionado) return;

  if (confirm('Tem certeza que quer apagar este arquivo?')) {
    try {
      await fetch(`${API_URL}/files/${arquivoSelecionado}`, {
        method: 'DELETE'
      });
      alert('Arquivo apagado!');
      limparFormulario();
      carregarArquivos();
    } catch (erro) {
      alert('Erro ao excluir!');
    }
  }
}

// Reseta a tela para criar um novo
function limparFormulario() {
  arquivoSelecionado = null;
  inputNome.value = '';
  inputNome.disabled = false;
  inputConteudo.value = '';
  statusModo.textContent = 'Modo: Novo';
  btnExcluir.style.display = 'none';
}

btnSalvar.addEventListener('click', salvarArquivo);
btnExcluir.addEventListener('click', excluirArquivo);
btnNovo.addEventListener('click', limparFormulario);

// Carrega os arquivos assim que entra na pagina
carregarArquivos();