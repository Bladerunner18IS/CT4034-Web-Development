<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";

if ($_SERVER['REQUEST_METHOD'] == "GET") {

    $user = $tokenAuth->authenticateJWTToken();

    if (isset($user['type'])) {
        
        if (in_array($user['type'], ['police', 'admin']) && isset($_GET[$bike_id])) {

            $bikes = $bikeGateway->getByBikeId($_GET['bike_id']);
        
        } elseif ($user['type'] === 'public') {

            $bikes = $bikeGateway->getAllByUserId(id: $user['user_id']);

        }
    } else {

        http_response_code(response_code: 401);
        echo json_encode(value: ["message" => "Invalid access token"]);
        exit();
    }

    foreach ($bikes as $bike_id => &$bike) 
    {
        $bike['images'] = $bikeGateway->getImagesByBikeId(id: $bike_id);
    }

    http_response_code(response_code: 200);
    echo json_encode(value: $bikes);

} elseif ($_SERVER['REQUEST_METHOD'] == "POST") {
    
    $user = $tokenAuth->authenticateJWTToken();

    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

    if (str_contains($contentType, 'application/json')) {
        $data = json_decode(json: file_get_contents(filename: 'php://input'), associative: true);
        if (!is_array($data)) {
            http_response_code(response_code: 415);
            echo json_encode(value: ["message" => "Unsupported request format"]);
            exit();
        }
    } else {
        $data = $_POST;
    }

    $validator = new Validator($data);

    $validator->field('manufacturer_part_number')->required()->max_len(50);
    $validator->field('brand')->required()->max_len(50);
    $validator->field('model')->required()->max_len(100);
    $validator->field('type')->required()->max_len(50);
    $validator->field('wheel_size')->required()->max_len(20);
    $validator->field('colour')->required()->max_len(30);
    $validator->field('number_of_gears')->required()->max_len(3);
    $validator->field('brake_type')->required()->max_len(30);
    $validator->field('suspension')->required()->max_len(30);
    $validator->field('gender')->required()->max_len(20);
    $validator->field('age_group')->required()->max_len(20);
    $validator->field('status')->required()->max_len(20);

    if (!$validator->is_valid()) {
        http_response_code(response_code: 400);
        echo json_encode(value: ["validation_errors" => $validator->error_messages]);
        exit();
    }

    $data['user_id'] = $user['user_id'];

    $bikeId = $bikeGateway->createBike($data);
    if (!$bikeId) {
        http_response_code(response_code: 500);
        echo json_encode(value: ["message" => "Unable to save bike."]);
        exit();
    }

    http_response_code(response_code: 200);
    echo json_encode(value: ["message" => "Bike added successfully.", "bike_id" => $bikeId]);

} else {

    header(header: "Allow: GET, POST", replace: true, response_code: 405);

}