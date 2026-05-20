<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";


if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim(string: $_SERVER["CONTENT_TYPE"]) : '';

    if ($contentType === 'application/json') {
        $data = json_decode(json: file_get_contents(filename: 'php://input'), associative: true);
    }

    else if ($contentType === 'application/x-www-form-urlencoded') {
        $data = $_POST;
    }

    else {
        http_response_code(response_code: 415);
        echo json_encode(value: ["message" => "Unsupported request format"]);
        exit();
    }

    $v = new Validator($data);

    $v->field('email')->required()->email();
    $v->field('password')->required();

    if(!$v->is_valid()){
        http_response_code(response_code: 400);
        echo json_encode(value: ["validation_errors" => $v->error_messages]);
        exit();
    }


    if ($data === null) {
        http_response_code(response_code: 400);
        echo json_encode(value: ["message" => "Missing login credentials"]);
        exit();
    }


    if (!array_key_exists(key: 'email', array: $data) || !array_key_exists(key: 'password', array: $data)) {
        http_response_code(response_code: 400);
        echo json_encode(value: ["message" => "Missing login credentials"]);
        exit();
    }

    $user = $userGateway->getUser($data['email']);

    if ($user === false) {
        http_response_code(response_code: 401);
        echo json_encode(value: ["message" => "Invalid Authentication"]);
        exit();
    }

    if (!password_verify(password: $data['password'], hash: $user['password_hash'])){
        http_response_code(response_code: 401);
        echo json_encode(value: ["message" => "Invalid Authentication"]);
        exit();
    }

    $payload = [
        "user_id" => $user['user_id'],
        "email" => $user['email'],
        "name" => $user['name'],
        "type" => $user['type'],
        "iss" => "s4513209-ct4034.uogs.co.uk",
        "iat" => time(),
        "exp" => time() + $_ENV['REFRESH_TTL']
    ];

    $refreshToken = $refreshController->encode(payload: $payload);

    $secureCookie = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

    setcookie(
        "REFRESH",
        "Bearer " . $refreshToken,
        [
            'expires' => $payload['exp'],
            'httponly' => true,
            'secure' => $secureCookie,
            'samesite' => 'Strict', 
            'path' => "/api/refresh"
        ]
    );

    setcookie(
        "role",
        $user['type'],
        [
            'expires' => $payload['exp'],
            'secure' => $secureCookie,
            'samesite' => 'Strict',
            'path' => '/'
        ]
        );
    


    http_response_code(response_code: 204);
    exit();
}

else {
    header(header: "Allow: POST", replace: true, response_code: 405);
    header(header: "Accept: application/json, application/x-www-form-urlencoded", replace: true);
    exit();
}