<?php

require dirname(path: __DIR__) . "/vendor/autoload.php";
require __DIR__ . "/Database.php";
require __DIR__ . "/UserGateway.php";
require __DIR__ . "/BikeGateway.php";
require __DIR__ . "/CaseGateway.php";
require __DIR__ . "/Jwt.php";
require __DIR__ . "/Auth.php";
require __DIR__ . "/Validator.php";
require __DIR__ . "/ImageGateway.php";

$currentPage = $_SERVER['REQUEST_URI'];

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
$bikeGateway = new BikeGateway(database: $database);
$caseGateway = new CaseGateway(database: $database);
$imageGateway = new ImageGateway(database: $database);

$tokenController = new Jwt(key: $_ENV['ACCESS_SECRET']);
$refreshController = new Jwt(key: $_ENV['REFRESH_SECRET']);

$tokenAuth = new Auth(userGateway: $userGateway, tokenController: $tokenController, refreshController: $refreshController);

