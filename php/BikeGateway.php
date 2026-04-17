<?php

class BikeGateway
{


    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }


    public function getByUserId(int $id): array
    {
        $sql = <<<'EOD'
            SELECT *
            FROM bikes 
            WHERE user_id = :user_id 
            ORDER BY date_entered ASC
        EOD;
        
        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':user_id', value: $id, type: PDO::PARAM_INT);

        $statement->execute();

        $response = $statement->fetchAll(mode: PDO::FETCH_ASSOC);
        $converted = array();

        foreach ($response as $row) {
            $converted[$row['bike_id']] = $row;
            unset($converted[$row['bike_id']]['bike_id']);
        }

        return $converted;
    }

    public function getImagesByBikeId(int $id) : array
    {
        $sql = <<<'EOD'
            SELECT image_name, image_description, image_filename
            FROM images
            WHERE bike_id = :bike_id
        EOD;

        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':bike_id', value: $id, type: PDO::PARAM_INT);

        $statement->execute();

        return $statement->fetchAll(mode: PDO::FETCH_ASSOC);
    }
}