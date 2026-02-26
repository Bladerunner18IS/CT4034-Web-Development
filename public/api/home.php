<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/src/Config.php";

$user = $tokenAuth->AuthenticateJWTToken();

$bikes = $bikeGateway->getByUserId(id: $user['user_id']);


?>
<!DOCTYPE html>

<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gloucester Bike Registry</title>
    <link rel="stylesheet" href="../css/style.css">
</head>

<body>
    
    <?php include_once dirname(path: __DIR__) . '/php/Navbar.php'; ?>

</body>

</html>
