<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";

if ($_SERVER['REQUEST_METHOD'] == "GET") {

    $newToken = $tokenAuth->refreshJWTToken();

    http_response_code(response_code: 200);
    echo json_encode(value: ["token" => $newToken]);
    exit();
}

else {
    header(header: "Allow: GET", replace: true, response_code: 405);
    header(header: "Accept: application/json", replace: true);
    exit();
}