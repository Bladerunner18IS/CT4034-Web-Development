<?php

class BikeGateway
{


    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }


    public function getAllByUserId(int $id): array
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

    public function getByBikeId($id): array
    {
        $sql = "SELECT * FROM bikes WHERE bikes.bike_id = :bike_id LIMIT 1";
        
        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ":bike_id", value: $id, type: PDO::PARAM_INT);

        $statement->execute();

        return $statement->fetch(mode: PDO::FETCH_ASSOC);
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

    public function createBike(array $bikeData): int | false
    {
        $sql = <<<'EOD'
            INSERT INTO bikes ( 
                user_id, 
                manufacturer_part_number, 
                brand, 
                model, 
                type, 
                wheel_size, 
                colour, 
                number_of_gears, 
                brake_type, 
                suspension, 
                gender, 
                age_group, 
                status, 
                date_entered, 
                date_last_updated 
            ) VALUES ( 
                :user_id, 
                :manufacturer_part_number, 
                :brand, 
                :model, 
                :type, 
                :wheel_size, 
                :colour, 
                :number_of_gears, 
                :brake_type, 
                :suspension, 
                :gender, 
                :age_group, 
                :status, 
                CURDATE(), 
                CURDATE()
            )
        EOD;

        $statement = $this->conn->prepare(query: $sql);

        $statement->bindValue(param: ':user_id', value: $bikeData['user_id'], type: PDO::PARAM_INT);
        $statement->bindValue(param: ':manufacturer_part_number', value: $bikeData['manufacturer_part_number'] , type: PDO::PARAM_STR);
        $statement->bindValue(param: ':brand', value: $bikeData['brand'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':model', value: $bikeData['model'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':type', value: $bikeData['type'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':wheel_size', value: $bikeData['wheel_size'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':colour', value: $bikeData['colour'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':number_of_gears', value: $bikeData['number_of_gears'], type: PDO::PARAM_INT);
        $statement->bindValue(param: ':brake_type', value: $bikeData['brake_type'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':suspension', value: $bikeData['suspension'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':gender', value: $bikeData['gender'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':age_group', value: $bikeData['age_group'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':status', value: $bikeData['status'], type: PDO::PARAM_STR);

        if (!$statement->execute()) {
            return false;
        }

        return (int)$this->conn->lastInsertId();
    }
}