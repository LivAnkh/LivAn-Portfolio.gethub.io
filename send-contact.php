<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
    exit;
}

$env = [];
$envFile = __DIR__ . '/.env';

if (is_readable($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(ltrim($line), '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
}

$token = $env['TELEGRAM_BOT_TOKEN'] ?? getenv('TELEGRAM_BOT_TOKEN');
$chatId = $env['TELEGRAM_CHAT_ID'] ?? getenv('TELEGRAM_CHAT_ID');

if (!$token || !$chatId) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Telegram configuration is missing']);
    exit;
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Please complete the form with a valid email']);
    exit;
}

$text = implode("\n", [
    'New website contact message',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
    'Phone: ' . ($phone !== '' ? $phone : 'Not provided'),
    'Message: ' . $message,
]);

$apiUrl = 'https://api.telegram.org/bot' . $token . '/sendMessage';
$payload = http_build_query([
    'chat_id' => $chatId,
    'text' => $text,
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => $payload,
        'timeout' => 10,
        'ignore_errors' => true,
    ],
]);

$response = file_get_contents($apiUrl, false, $context);
$result = $response !== false ? json_decode($response, true) : null;

if (!is_array($result) || empty($result['ok'])) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'message' => 'Message could not be delivered']);
    exit;
}

echo json_encode(['ok' => true, 'message' => 'Message sent successfully']);
