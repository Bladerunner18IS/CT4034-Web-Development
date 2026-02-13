<?php

require dirname(path: __DIR__) . "/vendor/autoload.php";
require __DIR__ . "/Database.php";
require __DIR__ . "/UserGateway.php";
require __DIR__ . "/Jwt.php";
require __DIR__ . "/Auth.php";

$dotenv = Dotenv\Dotenv::createImmutable(paths: dirname(path: __DIR__));
$dotenv->load();

$database = new Database(
        host: $_ENV['DB_HOST'],
        name: $_ENV['DB_NAME'],
        user: $_ENV['DB_USER'],
        password: $_ENV['DB_PASS']
    );

$conn = $database->getConnection();

$userGateway = new UserGateway(database: $database);

$jwtCtrl = new Jwt(key: $_ENV['SECRET']);

$auth = new Auth(userGateway: $userGateway, jwtCtrl: $jwtCtrl);