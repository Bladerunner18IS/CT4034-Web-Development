<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";


if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim(string: $_SERVER["CONTENT_TYPE"]) : '';

    if ($contentType === 'application/json') {
        $userData = json_decode(json: file_get_contents(filename: 'php://input'), associative: true);
    }

    else if ($contentType === 'application/x-www-form-urlencoded') {
        $userData = $_POST;
    }

    else {
        http_response_code(response_code: 415);
        echo json_encode(value: ["message" => "Unsupported request format"]);
        exit();
    }

    $v = new Validator($userData);

    $v->field('email')->required()->email();
    $v->field('name')->required()->alpha_ap();
    $v->field('password')->required()->min_len(8)->max_len(50)->must_contain('@#$&!.')->must_contain('a-z')->must_contain('A-Z')->must_contain('0-9');

    if(!$v->is_valid()){
        http_response_code(response_code: 400);
        echo json_encode(value: ["validation_errors" => $v->error_messages]);
        exit();
    }

    $userData['type'] = 'public';
    
    $newUser = $userGateway->createUser($userData);

    if (!$newUser) {
        http_response_code(response_code: 500);
        echo json_encode(value: ["message" => "Unable to register."]);
        exit();
    }

    http_response_code(response_code: 200);
    echo json_encode(value: ["message" => "Successfully registered"]);

} else {

    header(header: "Allow: POST", replace: true, response_code: 405);
    header(header: "Accept: application/json, application/x-www-form-urlencoded", replace: true);
    exit;
}