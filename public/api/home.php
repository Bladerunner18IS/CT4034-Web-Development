<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";

$user = $tokenAuth->AuthenticateJWTToken();

$bikes = $bikeGateway->getByUserId(id: $user['user_id']);

http_response_code(response_code: 200);
echo json_encode(value: $bikes);