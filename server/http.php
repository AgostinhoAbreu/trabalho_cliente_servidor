<?php

// Envia uma resposta JSON e encerra a requisicao atual.
function respond(mixed $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Padroniza as respostas de erro da API.
function fail(string $message, int $status): never
{
    respond(['error' => $message], $status);
}

// Le o JSON enviado no corpo de uma requisicao.
function request_data(): array
{
    return json_decode(file_get_contents('php://input'), true) ?: [];
}