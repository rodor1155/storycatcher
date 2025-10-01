<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get the posted data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['type']) || !isset($data['content'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data format']);
    exit();
}

$type = $data['type'];
$content = $data['content'];

// Validate type
$allowed_types = ['episodes', 'clans', 'locations'];
if (!in_array($type, $allowed_types)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid content type']);
    exit();
}

// Determine file path
$file_path = "../data/{$type}.json";

// Ensure data directory exists
if (!file_exists('../data')) {
    mkdir('../data', 0755, true);
}

// Write the content to the JSON file
$json_content = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if (file_put_contents($file_path, $json_content) !== false) {
    echo json_encode([
        'success' => true,
        'message' => ucfirst($type) . ' updated successfully',
        'count' => count($content)
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write file']);
}
?>