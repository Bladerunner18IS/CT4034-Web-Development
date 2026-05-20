<?php

class UserGateway
{


    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }

    public function adminUserRequest(array $params): array
    {
        $sql = "SELECT user_id, email, name, type, created_at FROM users WHERE TRUE";
        $queryParams = [];

        if (isset($params['type'])) {
            $sql .= " AND type = :type";
            $queryParams[':type'] = $params['type'];
        }

        if (isset($params['search'])) {
            $sql .= " AND (name LIKE :exp OR email LIKE :exp OR user_id LIKE :exp)";
            $queryParams[':exp'] = "%" . $params['search'] . "%";
        }

        $allowedSort = ['name', 'email', 'user_id', 'type', 'created_at'];

        if (isset($params['sort']) && in_array($params['sort'], $allowedSort, true)) {
            $sql .= " ORDER BY " . $params['sort'] . " ";
        } else {
            $sql .= " ORDER BY name DESC ";
        }

        $sql .= " LIMIT 50";

        if (isset($params['page'])) {
            $sql .= " OFFSET :offset";
            $queryParams[':offset'] = max(0, ((int)$params['page'] - 1) * 50);
        }

        $statement = $this->conn->prepare($sql);

        foreach ($queryParams as $key => $value) {
            // bind offset as int when applicable
            if ($key === ':offset') {
                $statement->bindValue($key, $value, PDO::PARAM_INT);
            } else {
                $statement->bindValue($key, $value, PDO::PARAM_STR);
            }
        }

        $statement->execute();

        return $statement->fetchAll(mode: PDO::FETCH_ASSOC);
    }

    public function createUser(array $params): array | false 
    {
        $sql = <<<'EOD'
            INSERT INTO users (
                email, 
                name, 
                password_hash,
                type
            ) VALUES (
                :email, 
                :name, 
                :password_hash,
                :type
            )
        EOD;

        $statement = $this->conn->prepare(query: $sql);

        $password_hash = password_hash(password: $params["password"], algo: PASSWORD_BCRYPT);


        $statement->bindValue(param: ":email", value: $params["email"], type: PDO::PARAM_STR);
        $statement->bindValue(param: ":name", value: $params["name"], type: PDO::PARAM_STR);
        $statement->bindValue(param: ":password_hash", value: $password_hash, type: PDO::PARAM_STR);
        $statement->bindValue(param: ":type", value: $params['type'], type: PDO::PARAM_STR);

        if (!$statement->execute()) {
            return false;
        }

        unset($params["password"]);

        return $params;
    }

    public function updateUser(int $user_id, array $newValues): mixed
    {
        $invalid = array_diff(array_keys($newValues), ['email', 'name', 'password_hash', 'type']);

        if ($invalid) {
            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => "At least one chosen field cannot be updated."]);
        }

        $sql = "UPDATE users SET";
        

        foreach ($newValues as $param => $value) {

            $sql .= " $param = :$param,";
        }

        $sql = rtrim($sql, ",");

        $sql .= " WHERE user_id = :user_id;";

        $statement = $this->conn->prepare($sql);
        $statement->bindValue(param: "user_id", value: $user_id, type: PDO::PARAM_STR);

        foreach ($newValues as $param => $value) {

            $statement->bindValue(param: ":$param", value: $value, type: PDO::PARAM_STR);
        }

        if (!$statement->execute()) {
            return false;
        }

        $newUser = $this->getUser($user_id);
        unset($newUser['password_hash']);

        return $newUser;
    }

    public function deleteUser(int $user_id): bool 
    {

        $sql = "DELETE FROM users WHERE user_id = :user_id";

        $statement = $this->conn->prepare($sql);
        $statement->bindValue(param: ":user_id", value: $user_id, type: PDO::PARAM_INT);

        if (!$statement->execute()) {
            return false;
        }

        return true;
    }

    public function __call(string $name, array $args): mixed
    {
        
        if ($name == 'getUser') {

            switch (gettype(value: $args[0])) {

                case "integer":
                    $type = "user_id";
                    break;

                case "string":
                    $type = "email";
                    break;

                default:
                    return false;
            }

            // only allow the two resolved column names to be used in the query
            if (!in_array($type, ['user_id', 'email'], true)) {
                return false;
            }

            $sql = "SELECT * FROM users WHERE " . $type . " = :input";
            $statement = $this->conn->prepare(query: $sql);

            // bind as int for user_id, string for email
            if ($type === 'user_id') {
                $statement->bindValue(param: ':input', value: (int)$args[0], type: PDO::PARAM_INT);
            } else {
                $statement->bindValue(param: ':input', value: $args[0], type: PDO::PARAM_STR);
            }

            $statement->execute();

            return $statement->fetch(mode: PDO::FETCH_ASSOC);
        }

        else {
            throw new BadMethodCallException();
        }
    }
}