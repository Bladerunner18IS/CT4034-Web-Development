<?php

class UserGateway
{


    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    public function __call(string $name, array $args): mixed{
        
        if ($name == 'getUser') {

            switch (gettype(value: $args[0])) {

                case "int":
                    $type = "user_id";
                    break;

                case "string":
                    $type = "email";
                    break;

                default:
                    return false;
            }

            $sql = 'SELECT * FROM users WHERE ' . $type . ' = :input';
            $statement = $this->conn->prepare(query: $sql);
            $statement->bindValue(param: ':input', value: $args[0], type: PDO::PARAM_STR);

            $statement->execute();

            return $statement->fetch(mode: PDO::FETCH_ASSOC);
        }

        else {
            throw new BadMethodCallException();
        }
    }
}