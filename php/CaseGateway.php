<?php

class CaseGateway
{


    private PDO $conn;

    public function __construct(Database $database)
    {
        $this->conn = $database->getConnection();
    }


    public function getCasesByUserid(int $id): array 
    {
        $sql = <<<'EOD'
            SELECT *
            FROM cases
            WHERE user_id = :user_id 
            ORDER BY date_opened ASC
        EOD;

        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':user_id', value: $id, type: PDO::PARAM_INT);

        $statement->execute();

        return $statement->fetchAll(mode: PDO::FETCH_ASSOC);
    }

    public function getCasesForPolice(int $officerId, string $range = 'all'): array
    {
        $sql = <<<'EOD'
            SELECT 
                cases.*, 
                bikes.brand, 
                bikes.model, 
                bikes.manufacturer_part_number, 
                images.image_filename,
                EXISTS (
                    SELECT 1
                    FROM case_logs
                    WHERE case_logs.case_id = cases.case_id
                    AND case_logs.officer_id = :officer_id
                ) AS officer_updated
            FROM cases
            INNER JOIN bikes ON bikes.bike_id = cases.bike_id
            INNER JOIN images ON images.bike_id = bikes.bike_id AND images.is_primary = 1
        EOD;

        $params = [':officer_id' => $officerId];

        $startDate = $this->getRangeStartDate($range);
        if ($startDate !== null) {
            $sql .= ' WHERE cases.date_opened >= :start_date';
            $params[':start_date'] = $startDate;
        }

        $sql .= ' ORDER BY cases.date_opened DESC;';

        $statement = $this->conn->prepare(query: $sql);
        foreach ($params as $param => $value) {
            $statement->bindValue(param: $param, value: $value, type: PDO::PARAM_STR);
        }

        $statement->execute();

        return $statement->fetchAll(mode: PDO::FETCH_ASSOC);
    }

    public function resolveCaseId(string $identifier): ?int
    {
        $sql = <<<'EOD'
            SELECT case_id
            FROM cases
            WHERE reference = :identifier
            LIMIT 1
        EOD;

        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':identifier', value: $identifier, type: PDO::PARAM_STR);
        $statement->execute();

        $row = $statement->fetch(mode: PDO::FETCH_ASSOC);
        if (!empty($row['case_id'])) {
            return (int)$row['case_id'];
        }

        if (ctype_digit($identifier)) {
            $sql = <<<'EOD'
                SELECT case_id
                FROM cases
                WHERE case_id = :identifier
                LIMIT 1
            EOD;

            $statement = $this->conn->prepare(query: $sql);
            $statement->bindValue(param: ':identifier', value: (int)$identifier, type: PDO::PARAM_INT);
            $statement->execute();

            $row = $statement->fetch(mode: PDO::FETCH_ASSOC);
            return $row ? (int)$row['case_id'] : null;
        }

        return null;
    }

    private function getRangeStartDate(string $range): ?string
    {
        $now = new DateTimeImmutable();

        switch (strtolower(trim($range))) {
            case 'today':
                return $now->format('Y-m-d');
            case 'week':
                return $now->modify('-7 days')->format('Y-m-d');
            case 'month':
                return $now->modify('-30 days')->format('Y-m-d');
            case 'year':
                return $now->modify('-365 days')->format('Y-m-d');
            default:
                return null;
        }
    }

    public function getCaseOwnerId(int $caseId): int
    {
        $sql = <<<'EOD'
            SELECT user_id
            FROM cases
            WHERE case_id = :case_id
            LIMIT 1
        EOD;

        $statement = $this->conn->prepare($sql);
        $statement->bindValue(param: ':case_id', value: $caseId, type: PDO::PARAM_INT);
        
        if (!$statement->execute()) {

            http_response_code(response_code: 500);
            echo json_encode(value: ["message" => "SQL Error"]);
            exit();
        }

        return $statement->fetch()['user_id'];
    }

    public function getLogsForCase(int $caseId): array
    {
        $sql = <<<'EOD'
            SELECT *
            FROM case_logs
            WHERE case_id = :case_id
            ORDER BY submission_timestamp DESC
        EOD;

        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':case_id', value: $caseId, type: PDO::PARAM_INT);

        $statement->execute();

        return $statement->fetchAll(mode: PDO::FETCH_ASSOC);
    }

    public function createCase(array $caseData): int | false
    {
        $sql = <<<'EOD'
            INSERT INTO cases ( 
                reference,
                user_id,
                bike_id,
                case_status,
                date_opened
            ) VALUES ( 
                :reference,
                :user_id,
                :bike_id,
                'open',
                CURDATE()
            )
        EOD;

        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':reference', value: substr(md5(random_bytes(16)), 0, 10), type: PDO::PARAM_STR);
        $statement->bindValue(param: ':user_id', value: $caseData['user_id'], type: PDO::PARAM_INT);
        $statement->bindValue(param: ':bike_id', value: $caseData['bike_id'], type: PDO::PARAM_INT);

        if (!$statement->execute()) {
            return false;
        }

        $newCaseId = (int)$this->conn->lastInsertId();

        $sql = <<<'EOD'
            INSERT INTO case_logs (
                case_id,
                officer_id,
                description,
                new_status
            ) VALUES (
                :case_id,
                1,
                :description,
                'open'
            )
        EOD;

        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':case_id', value: $newCaseId, type: PDO::PARAM_INT);
        $statement->bindValue(param: ':description', value: $caseData['description'], type: PDO::PARAM_STR);
    
        if (!$statement->execute()) {
            return false;
        }

        return (int)$this->conn->lastInsertId();
    }

    public function addLogEntry(array $logData): int | false
    {
        $sql = <<<'EOD'
            INSERT INTO case_logs (
                case_id,
                officer_id,
                description,
                new_status
            ) VALUES (
                :case_id,
                :officer_id,
                :description,
                :new_status
            )
        EOD;

        $statement = $this->conn->prepare(query: $sql);
        $statement->bindValue(param: ':case_id', value: $logData['case_id'], type: PDO::PARAM_INT);
        $statement->bindValue(param: ':officer_id', value: $logData['officer_id'], type: PDO::PARAM_INT);
        $statement->bindValue(param: ':description', value: $logData['description'], type: PDO::PARAM_STR);
        $statement->bindValue(param: ':new_status', value: $logData['new_status'], type: PDO::PARAM_STR);

        if (!$statement->execute()) {
            return false;
        }

        return (int)$this->conn->lastInsertId();
    }
}