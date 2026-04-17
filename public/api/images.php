<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";


if ($_SERVER['REQUEST_METHOD'] == "GET") {

    if (!isset($_GET['type'], $_GET['bike_id'])) {

        http_response_code(response_code: 400);
        echo json_encode(value: ["message" => "Invalid request format"]);
        exit;
    }

    $user = $tokenAuth->authenticateJWTToken();


    $imagepath = $imageGateway->retrieveImage(user_id: $user['user_id']);
    $fp = fopen($imagepath, 'rb');

    header("Content-Type: image/" . $_GET['ext']);
    header("Content-Length: " . filesize($imagepath));

    fpassthru($fp);
    exit;
}