<?php
declare(strict_types=1);

require_once dirname(path: __DIR__) . "/src/Config.php";

$user = $tokenAuth->AuthenticateJWTToken() ?: $tokenAuth->refreshJWTToken();


if (!$user) {

    setcookie(name: "AUTHORIZATION", value: "", expires_or_options: time() - 3600); //unset cookies
    setcookie(name: "REFRESH", value: "", expires_or_options: time() - 3600);
    header(header: "Location: /login.php");
    exit();

} else if ($user['type'] === "admin") {

    header(header: "Location: /admin.php");
    exit();

} else if ($user['type'] === "police") {

    header(header: "Location: /police.php");
    exit();

}


$bikes = $bikeGateway->getByUserId(id: $user['user_id']);


?>
<!DOCTYPE html>

<html>
    
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gloucester Bike Registry</title>
    <link rel="stylesheet" href="../style.css">
</head>

<body>
    
    <?php include_once dirname(path: __DIR__) . '/src/Navbar.php'; ?>

</body>

</html>
