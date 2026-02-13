<?php
declare(strict_types=1);

require_once dirname(path: __DIR__) . "/src/Config.php";

$user = $auth->AuthenticateJWTToken();

if (!$user) {
    header(header: "Location: /login.php");
    exit();
} 
else {
    http_response_code(response_code: 200);
    echo json_encode(value: ["message" => "Hello " . $user['name']]);
    exit();
}