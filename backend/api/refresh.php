<?php
declare(strict_types=1);

require_once dirname(path: __DIR__) . "/src/Config.php";

$newToken = $tokenAuth->refreshJWTToken();

http_response_code(response_code: 200);
echo json_encode(value: ["token" => "Bearer " . $newToken, "expires_in" => $_ENV['ACCESS_TTL']]);
exit();