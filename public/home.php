<?php
declare(strict_types=1);

require_once dirname(path: __DIR__) . "/src/Config.php";

$user = $tokenAuth->AuthenticateJWTToken() ?: $tokenAuth->refreshJWTToken();


if (!$user) {
    setcookie(name: "AUTHORIZATION", value: "", expires_or_options: time() - 3600); //unset cookies
    setcookie(name: "REFRESH", value: "", expires_or_options: time() - 3600);
    header(header: "Location: /login.php");
    exit();
} 


http_response_code(response_code: 200);
echo json_encode(value: ["message" => "Hello " . $user['name']]);
exit();
