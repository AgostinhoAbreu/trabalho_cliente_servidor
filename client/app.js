const API_URL = 'http://127.0.0.1:8080';

// Elementos da Interface
const fileListElement = document.getElementById('file-list');
const fileNameInput = document.getElementById('file-name-input');
const fileContentInput = document.getElementById('file-content-input');
const btnSalvar = document.getElementById('btn-salvar');
const btnDeletar = document.getElementById('btn-deletar');
const btnNovo = document.getElementById('btn-novo');
const badgeMode = document.getElementById('badge-mode');
const searchInput = document.getElementById('search-input');
const charCount = document.getElementById('char-count');
const toast = document.getElementById('toast');

// Estado da Aplicação
let currentSelectedFile = null;
let allFiles = [];

// Exibe avisos na tela
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// 1. LISTAR ARQUIVOS (GET /files)
async function fetchFiles() {
  try {
    const response = await fetch(`${API_URL}/files`);
    if (!response.ok) throw new Error('Erro ao listar arquivos');
    
    allFiles = await response.json();
    renderFileList(allFiles);
  } catch (error) {
    showToast('Não foi possível conectar ao servidor', 'error');
  }
}

// Renderiza a lista na barra lateral
function renderFileList(files) {
  fileListElement.innerHTML = '';
  
  if (files.length === 0) {
    fileListElement.innerHTML = `<li style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem;">Nenhum arquivo encontrado.</li>`;
    return;
  }

  files.forEach(file => {
    const li = document.createElement('li');
    li.className = `file-item ${currentSelectedFile === file.name ? 'active' : ''}`;
    li.innerHTML = `
      <div class="file-item-name">
        <i data-lucide="file-text"></i>
        <span>${file.name}</span>
      </div>
    `;
    li.onclick = () => loadFileContent(file.name);
    fileListElement.appendChild(li);
  });

  if (window.lucide) lucide.createIcons();
}

// 2. LER ARQUIVO (GET /files/{nome})
async function loadFileContent(fileName) {
  try {
    const response = await fetch(`${API_URL}/files/${encodeURIComponent(fileName)}`);
    if (!response.ok) throw new Error('Erro ao carregar conteúdo do arquivo');
    
    const content = await response.text();
    
    currentSelectedFile = fileName;
    fileNameInput.value = fileName;
    fileNameInput.disabled = true; // Impede editar o nome enquanto estiver no modo de edição
    fileContentInput.value = content;
    
    // Atualiza estado da UI
    badgeMode.textContent = 'Modo Edição';
    badgeMode.className = 'badge badge-edit';
    btnDeletar.classList.remove('hidden');
    
    updateCharCount();
    fetchFiles(); // Recarrega a lista para atualizar a classe ativa
  } catch (error) {
    showToast('Erro ao carregar o arquivo', 'error');
  }
}

// 3. CRIAR (POST /files) OU ATUALIZAR (PUT /files/{nome})
async function saveFile() {
  const name = fileNameInput.value.trim();
  const content = fileContentInput.value;

  if (!name) {
    showToast('Digite um nome válido para o arquivo', 'error');
    return;
  }

  try {
    let response;
    
    if (currentSelectedFile) {
      // Atualizar existente (PUT)
      response = await fetch(`${API_URL}/files/${encodeURIComponent(currentSelectedFile)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
    } else {
      // Criar novo arquivo (POST)
      response = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content })
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao salvar arquivo');
    }

    showToast(currentSelectedFile ? 'Arquivo atualizado!' : 'Arquivo criado com sucesso!');
    currentSelectedFile = name;
    fileNameInput.disabled = true;
    badgeMode.textContent = 'Modo Edição';
    badgeMode.className = 'badge badge-edit';
    btnDeletar.classList.remove('hidden');

    fetchFiles();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// 4. EXCLUIR ARQUIVO (DELETE /files/{nome})
async function deleteFile() {
  if (!currentSelectedFile) return;

  const confirmDelete = confirm(`Deseja realmente excluir "${currentSelectedFile}"?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_URL}/files/${encodeURIComponent(currentSelectedFile)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao excluir arquivo');
    }

    showToast('Arquivo excluído com sucesso!');
    resetEditor();
    fetchFiles();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Reseta o editor para criar um novo arquivo
function resetEditor() {
  currentSelectedFile = null;
  fileNameInput.value = '';
  fileNameInput.disabled = false;
  fileContentInput.value = '';
  
  badgeMode.textContent = 'Novo Arquivo';
  badgeMode.className = 'badge badge-create';
  btnDeletar.classList.add('hidden');
  
  updateCharCount();
  fetchFiles();
}

// Filtro de busca na sidebar
searchInput.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allFiles.filter(f => f.name.toLowerCase().includes(term));
  renderFileList(filtered);
});

// Contador de caracteres
function updateCharCount() {
  charCount.textContent = `${fileContentInput.value.length} caracteres`;
}

fileContentInput.addEventListener('input', updateCharCount);

// Event Listeners dos botões
btnSalvar.addEventListener('click', saveFile);
btnDeletar.addEventListener('click', deleteFile);
btnNovo.addEventListener('click', resetEditor);

// Inicialização
fetchFiles();