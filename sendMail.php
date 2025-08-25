<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

$name = htmlspecialchars($input['name'] ?? '');
$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$message = htmlspecialchars($input['message'] ?? '');
$privacyAccepted = $input['privacypolicy'] ?? false;

if (empty($name) || !$email || empty($message) || !$privacyAccepted) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid required fields']);
    exit();
}

$to = 'kontakt@mihaela-melania-aghirculesei.de';
$subject = 'Neue Nachricht von Portfolio Website - ' . $name;

$emailBody = "Neue Nachricht von der Portfolio Website:\n\n";
$emailBody .= "Name: " . $name . "\n";
$emailBody .= "Email: " . $email . "\n";
$emailBody .= "Nachricht:\n" . $message . "\n\n";
$emailBody .= "Datenschutz akzeptiert: " . ($privacyAccepted ? 'Ja' : 'Nein') . "\n";
$emailBody .= "Gesendet am: " . date('Y-m-d H:i:s') . "\n";

$headers = "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $emailBody, $headers)) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
?>