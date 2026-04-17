<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";

if ($_SERVER['REQUEST_METHOD'] == "GET") {

    $user = $tokenAuth->AuthenticateJWTToken();

    $bikes = $bikeGateway->getByUserId(id: $user['user_id']);

    foreach ($bikes as $bike_id => &$bike) 
    {
        $bike['images'] = $bikeGateway->getImagesByBikeId(id: $bike_id);
    }

    http_response_code(response_code: 200);
    echo json_encode(value: $bikes);

} else {
    
    header(header: "Allow: GET", replace: true, response_code: 405);
}