<?php

class UserGateway
{


    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }


    public function getByEmail(string $email): array | false
    {
        $sql = 'SELECT * FROM users WHERE email = :email';
        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':email', value: $email, type: PDO::PARAM_STR);

        $statement->execute();

        return $statement->fetch(mode: PDO::FETCH_ASSOC);
    }
}