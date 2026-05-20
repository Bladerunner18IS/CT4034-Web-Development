<?php

class ImageGateway {


    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    public function userAllowedAccess($user): bool
    {
        if (in_array($user['type'], ["police", "admin"])) {
            return true;
        }

        $sql = "SELECT user_id FROM bikes WHERE bike_id=:bike_id LIMIT 1";

        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ":bike_id", value: $_GET['bike_id'], type: PDO::PARAM_INT);

        $statement->execute();

        return $statement->fetch(mode: PDO::FETCH_ASSOC)['user_id'] === $user['user_id'];
    }

    public function retrieveImagePath(): string
    {

        return (dirname(__DIR__) . "/uploads/" . $_GET['type'] . "/" . $_GET['bike_id'] . "/" . $_GET["file"]);
    
    }
}