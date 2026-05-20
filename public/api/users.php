<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";

if ($_SERVER['REQUEST_METHOD'] === "GET") {

    $user = $tokenAuth->AuthenticateJWTToken();

    if (!isset($user['type'])) {

        http_response_code(response_code: 403);
        echo json_encode(value: ["message" => "Invalid access token"]);
        exit();
    }

    if ($user['type'] === "admin" && isset($_GET['id'])) {

        
        $userDBData = $userGateway->getUser($_GET['id']);

        $returnData = array_intersect_key(
            $userDBData,
            array_flip(["email", "name", "type"])
        );

    } elseif ($user['type'] === "admin" && (isset($_GET['type']) || isset($_GET['search']))) {

        $params = array_intersect_key(
            $_GET, 
            array_flip(["type", "search", "sort", "page"])
        );

        if ($params['type'] === "all") {

            unset($params['type']);
        }

        $returnData = $userGateway->adminUserRequest($params);
    
    } else {

        $userDBData = $userGateway->getUser($user['user_id']);

        $returnData = array_intersect_key(
            $userDBData,
            array_flip(["email", "name", "type"])
        );

    }

    http_response_code(response_code: 200);
    echo json_encode(value: $returnData);


} elseif ($_SERVER['REQUEST_METHOD'] === "POST") {

    $user = $tokenAuth->AuthenticateJWTToken();

    if ($user['type'] !== 'admin') {

        http_response_code(response_code: 403);
        echo json_encode(value: ["message" => "Unauthorized"]);
        exit();
    }

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

    $userData['type'] = 'police';
    
    $newUser = $userGateway->createUser($userData);

    if (!$newUser) {
        http_response_code(response_code: 500);
        echo json_encode(value: ["message" => "Unable to register."]);
        exit();
    }

    http_response_code(response_code: 200);
    echo json_encode(value: $newUser);

} elseif ($_SERVER['REQUEST_METHOD'] === "PUT") {

    $user = $tokenAuth->AuthenticateJWTToken();

    if ($user['type'] !== "admin") {

        http_response_code(response_code: 403);
        echo json_encode(value: ["message" => "Unauthorized"]);
        exit();
    } 

    if (!isset($_GET['id'])) {
        http_response_code(response_code: 400);
        echo json_encode(value: ["message" => "Format: PUT /api/users/{id}"]);
        exit();
    }

    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim(string: $_SERVER["CONTENT_TYPE"]) : '';
    
    if ($contentType !== "application/json") {

        header(header: "Accept: application/json", replace: true, response_code: 415);
        exit();
    }
    
    $userData = json_decode(json: file_get_contents(filename: 'php://input'), associative: true);

    $newUserData = $userGateway->updateUser((int)$_GET['id'], $userData);

    if (!$newUserData) {
        http_response_code(response_code: 500);
        echo json_encode(value: ["message" => "Error updating user"]);
        exit();
    }

    http_response_code(response_code: 200);
    echo json_encode(value: $newUserData);
    exit();

} elseif ($_SERVER['REQUEST_METHOD'] === "DELETE") {

    $user = $tokenAuth->AuthenticateJWTToken();

    if ($user['type'] !== "admin") {

        http_response_code(response_code: 403);
        echo json_encode(value: ["message" => "Unauthorized"]);
        exit();
    } 

    if (!isset($_GET['id'])) {

        http_response_code(response_code: 422);
        echo json_encode(value: ["message" => "Usage: DELETE /api/users/{id}"]);
        exit();
    }

    if (!$userGateway->deleteUser((int)$_GET['id'])) {

        http_response_code(response_code: 400);
        echo json_encode(value: ["message" => "Delete failed"]);
        exit();
    }

    http_response_code(response_code: 204);
    exit();

} else {

    header(header: "Allow: GET, POST, PUT, DELETE", replace: true, response_code: 405);
}