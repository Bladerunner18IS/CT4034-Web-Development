<?php

class BikeGateway
{


    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }


    public function getByUserId(int $id): array | false
    {
        $sql = <<<'EOD'
            SELECT bikes.*, images.*
            FROM bikes 
            LEFT JOIN images 
            ON bikes.bike_id = images.bike_id
            WHERE user_id = :user_id 
            ORDER BY date_entered ASC
        EOD;
        
        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':user_id', value: $id, type: PDO::PARAM_INT);

        $statement->execute();

        return $statement->fetchAll(mode: PDO::FETCH_ASSOC);
    }
}