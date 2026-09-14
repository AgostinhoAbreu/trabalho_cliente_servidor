<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/http.php';
require_once __DIR__ . '/file_service.php';

// Cria a pasta de dados automaticamente na primeira execucao.
if (!is_dir(FILES_DIRECTORY)) {
    mkdir(FILES_DIRECTORY, 0755, true);
}

// Permite que o frontend, mesmo em outra porta, consuma esta API.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// O navegador envia OPTIONS antes de algumas requisicoes CORS.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Extrai o nome depois de /files/.
function route_file_name(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $prefix = '/files/';
    if (!str_starts_with($path, $prefix)) {
        fail('Rota nao encontrada.', 404);
    }

    return rawurldecode(substr($path, strlen($prefix)));
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// GET /files: lista os arquivos existentes.
if ($path === '/files' && $method === 'GET') {
    respond(list_files());
}

// POST /files: recebe {"name":"arquivo.txt","content":"texto"}.
if ($path === '/files' && $method === 'POST') {
    $data = request_data();
    create_file($data['name'] ?? '', $data['content'] ?? '');
}

// As rotas abaixo usam /files/{nome} para ler, atualizar ou excluir.
if (str_starts_with($path, '/files/')) {
    $name = route_file_name();

    if ($method === 'GET') {
        read_file_content($name);
    }

    if ($method === 'PUT') {
        $data = request_data();
        update_file($name, $data['content'] ?? '');
    }

    if ($method === 'DELETE') {
        delete_file($name);
    }
}

if ($path === '/files') {
    fail('Metodo nao permitido para esta rota.', 405);
}

fail('Rota nao encontrada.', 404);