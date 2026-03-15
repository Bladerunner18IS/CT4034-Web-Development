<?php

class Database
{
    private ?PDO $conn = null;

    public function __construct(
        private string $host,
        private string $name,
        private string $user,
        private string $password
    ) {

    }

    public function getConnection(): ?PDO
    {
        try {
            if ($this->conn == null) {
                $this->conn = new PDO(dsn: "mysql:host=$this->host;dbname={$this->name}", username: $this->user, password: $this->password);
                $this->conn->setAttribute(attribute: PDO::ATTR_ERRMODE, value: PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(attribute: PDO::ATTR_EMULATE_PREPARES, value: false);
                $this->conn->setAttribute(attribute: PDO::ATTR_STRINGIFY_FETCHES, value: false);
            }

            return $this->conn;
        } catch (PDOException $e) {
            echo json_encode(value: ["message" => "Connection failed: " . $e->getMessage()]);
            return null;
        }
    }
}