<?php

require_once dirname(path: __DIR__) . "/src/Config.php";

if (isset($_COOKIE["AUTHORIZATION"])) {
    header(header: "Location: /home.php");
    exit();
}

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


    if ($data === null) {
        http_response_code(response_code: 400);
        echo json_encode(value: ["message" => "Invalid JSON data"]);
        exit();
    }


    if (!array_key_exists(key: 'email', array: $data) || !array_key_exists(key: 'password', array: $data)) {
        http_response_code(response_code: 400);
        echo json_encode(value: ["message" => "Missing login credentials"]);
        exit();
    }

    $user = $userGateway->getByEmail(email: $data['email']);

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



    $tokenPayload = [
        "id" => $user['id'],
        "email" => $user['email'],
        "name" => $user['name'],
        "iss" => "s4513209-ct4034.uogs.co.uk",
        "iat" => time(),
        "exp" => time() + 60 * 15 //15 minutes
    ];

    $token = $tokenController->encode(payload: $tokenPayload);

    setcookie(
        "AUTHORIZATION",
        "Bearer " . $token,
        ['expires' => $tokenPayload['exp'], 'httponly' => true, 'secure' => true, 'samesite' => 'Strict']
    );



    $refreshPayload = [
        "id" => $user['id'],
        "email" => $user['email'],
        "name" => $user['name'],
        "iss" => "s4513209-ct4034.uogs.co.uk",
        "iat" => time(),
        "exp" => time() + 60 * 60 * 24 //1 day
    ];

    $refresh = $refreshController->encode(payload: $refreshPayload);

    setcookie(
        "REFRESH",
        "Bearer " . $refresh,
        ['expires' => $refreshPayload['exp'], 'httponly' => true, 'secure' => true, 'samesite' => 'Strict']
    );




    header(header: "Location: /home.php");
    exit();
}

?>
<!DOCTYPE html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Login</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div class="container">
        <h2>Login</h2>
        <form action="login.php" method="post">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="text" id="email" name="email" required>
            </div>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
                <input type="submit" value="Login">
            </div>
        </form>
    </div>
</body>

</html>