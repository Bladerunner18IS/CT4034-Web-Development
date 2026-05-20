<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";

if ($_SERVER['REQUEST_METHOD'] == "GET") {

    $user = $tokenAuth->authenticateJWTToken();

    if (isset($_GET['logs'])) {

        $caseIdentifier = $_GET['case_ref'] ?? null;
        if ($caseIdentifier === null) {
            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => "Missing case identifier"]);
            exit();
        }

        $caseId = $caseGateway->resolveCaseId($caseIdentifier);
        if ($caseId === null) {
            http_response_code(response_code: 404);
            echo json_encode(value: ["message" => "Case not found"]);
            exit();
        }
        
        $caseLogs = $caseGateway->getLogsForCase($caseId);

        http_response_code(response_code: 200);
        echo json_encode(value: $caseLogs);
    
    } else {

        $range = isset($_GET['range']) ? strtolower(trim($_GET['range'])) : 'all';

        if (isset($user['type']) && in_array($user['type'], ['police', 'admin'])) {
            $cases = $caseGateway->getCasesForPolice($range);
        } else {
            $cases = $caseGateway->getCasesByUserid(id: $user['user_id']);
        }

        http_response_code(response_code: 200);
        echo json_encode(value: $cases);
    }
    

} elseif ($_SERVER['REQUEST_METHOD'] == "POST") {

    $user = $tokenAuth->authenticateJWTToken();

    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

    if (str_contains($contentType, 'application/json')) {
        $data = json_decode(json: file_get_contents(filename: 'php://input'), associative: true);
        if (!is_array($data)) {
            http_response_code(response_code: 415);
            echo json_encode(value: ["message" => "Unsupported request format"]);
            exit();
        }
    } else {
        $data = $_POST;
    }

    if (isset($_GET['logs'])) {

        $caseIdentifier = $_GET['case_id'] ?? $_GET['reference'] ?? null;
        if ($caseIdentifier === null) {
            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => "Missing case identifier"]);
            exit();
        }

        $caseId = $caseGateway->resolveCaseId($caseIdentifier);
        if ($caseId === null) {
            http_response_code(response_code: 404);
            echo json_encode(value: ["message" => "Case not found"]);
            exit();
        }

        $data['case_id'] = $caseId;

        $validator = new Validator($data);

        $validator->field('case_id')->required()->max_len(4);
        $validator->field('officer_id')->required()->max_len(4);
        $validator->field('description')->required()->max_len(1300);
        $validator->field('new_status')->required()->exact_match(["open", "closed"]);

        if (!$validator->is_valid()) {
            http_response_code(response_code: 400);
            echo json_encode(value: ["validation_errors" => $validator->error_messages]);
            exit();
        }

        $logId = $caseGateway->addLogEntry($data);
        if (!$logId) {
            http_response_code(response_code: 500);
            echo json_encode(value: ["message" => "Unable to add log entry."]);
            exit();
        }

        http_response_code(response_code: 200);
        echo json_encode(value: ["message" => "Entry submitted successfully.", "log_id" => $logId]);

    } else {

        $data['user_id'] = $user['user_id'];

        $validator = new Validator($data);

        $validator->field('user_id')->required()->max_len(4);
        $validator->field('bike_id')->required()->max_len(4);
        $validator->field('description')->required()->max_len(1300);

        if (!$validator->is_valid()) {
            http_response_code(response_code: 400);
            echo json_encode(value: ["validation_errors" => $validator->error_messages]);
            exit();
        }

        $caseId = $caseGateway->createCase($data);
        if (!$caseId) {
            http_response_code(response_code: 500);
            echo json_encode(value: ["message" => "Unable to create case."]);
            exit();
        }

        http_response_code(response_code: 200);
        echo json_encode(value: ["message" => "New case created successfully.", "case_id" => $caseId]);
    }

} else {

    header(header: "Allow: GET, POST", replace: true, response_code: 405);

}