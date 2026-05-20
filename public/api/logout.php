<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";

if ($_SERVER['REQUEST_METHOD'] == "POST") {

    setcookie(
        "REFRESH",
        "",
        [
            'expires' => 0,
            'httponly' => true,
            'secure' => true,
            'samesite' => 'Strict', 
            'path' => "/api/refresh"
        ]
    );

    http_response_code(response_code: 200);
    echo "Logging out, goodbye!";
    exit();
}

else {
    header(header: "Allow: POST", replace: true, response_code: 405);
    exit();
}