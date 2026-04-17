<?php

class ImageGateway {


    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    public function retrieveImage(int $user_id): string
    {
        $sql = "SELECT user_id FROM bikes WHERE bike_id=:bike_id LIMIT 1";

        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ":bike_id", value: $_GET['bike_id'], type: PDO::PARAM_INT);

        $statement->execute();

        if ($statement->fetch(mode: PDO::FETCH_ASSOC)['user_id'] != $user_id) 
        {
            http_response_code(response_code: 403);
            exit('Forbidden');
        }

        return (dirname(__DIR__) . "/uploads/" . $_GET['type'] . "/" . $_GET['bike_id'] . "/" . $_GET["file"]);
    }
}