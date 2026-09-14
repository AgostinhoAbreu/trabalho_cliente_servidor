<?php

// Garante que o nome nao possa sair da pasta files (path traversal).
function valid_file_name(string $name): bool
{
    return $name !== '' && $name !== '.' && $name !== '..' && basename($name) === $name;
}

function file_path(string $name): string
{
    if (!valid_file_name($name)) {
        fail('Nome de arquivo invalido.', 400);
    }

    return FILES_DIRECTORY . DIRECTORY_SEPARATOR . $name;
}

// Lista apenas arquivos, ignorando subpastas e as entradas . e ..
function list_files(): array
{
    $files = [];
    foreach (scandir(FILES_DIRECTORY) ?: [] as $name) {
        if ($name === '.' || $name === '..' || !is_file(FILES_DIRECTORY . '/' . $name)) {
            continue;
        }
        $files[] = ['name' => $name];
    }
    return $files;
}

function create_file(string $name, string $content): never
{
    $file = file_path($name);
    if (file_exists($file)) {
        fail('O arquivo ja existe.', 409);
    }
    if (file_put_contents($file, $content, LOCK_EX) === false) {
        fail('Nao foi possivel criar o arquivo.', 500);
    }
    respond(['message' => 'Arquivo criado.', 'name' => $name], 201);
}

function read_file_content(string $name): never
{
    $file = file_path($name);
    if (!is_file($file)) {
        fail('Arquivo nao encontrado.', 404);
    }
    $content = file_get_contents($file);
    if ($content === false) {
        fail('Nao foi possivel ler o arquivo.', 500);
    }
    respond(['name' => $name, 'content' => $content]);
}

function update_file(string $name, string $content): never
{
    $file = file_path($name);
    if (!is_file($file)) {
        fail('Arquivo nao encontrado.', 404);
    }
    if (file_put_contents($file, $content, LOCK_EX) === false) {
        fail('Nao foi possivel atualizar o arquivo.', 500);
    }
    respond(['message' => 'Arquivo atualizado.', 'name' => $name]);
}

function delete_file(string $name): never
{
    $file = file_path($name);
    if (!is_file($file)) {
        fail('Arquivo nao encontrado.', 404);
    }
    if (!unlink($file)) {
        fail('Nao foi possivel excluir o arquivo.', 500);
    }
    respond(['message' => 'Arquivo excluido.', 'name' => $name]);
}