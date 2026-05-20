<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/php/Config.php";


if ($_SERVER['REQUEST_METHOD'] == "GET") {

    if (!isset($_GET['type'], $_GET['bike_id'])) {

        http_response_code(response_code: 400);
        echo json_encode(value: ["message" => "Invalid request format"]);
        exit();
    }

    $user = $tokenAuth->authenticateJWTToken();

    if (!$imageGateway->userAllowedAccess($user)) {
        
        http_response_code(response_code: 403);
        exit('Forbidden');
    }


    $imagepath = $imageGateway->retrieveImagePath();
    $fp = fopen($imagepath, 'rb');

    header("Content-Type: image/" . $_GET['ext']);
    header("Content-Length: " . filesize($imagepath));

    fpassthru($fp);
    exit();

} elseif ($_SERVER['REQUEST_METHOD'] == "POST") {
    // authenticate user
    $user = $tokenAuth->authenticateJWTToken();

    // Expect a bike_id in POST
    $bikeId = isset($_POST['bike_id']) ? (int)$_POST['bike_id'] : 0;
    if ($bikeId <= 0) {
        http_response_code(response_code: 400);
        echo json_encode(value: ['message' => 'Missing or invalid bike_id']);
        exit();
    }

    // verify bike belongs to user
    $stmt = $conn->prepare(query: 'SELECT user_id FROM bikes WHERE bike_id = :bike_id LIMIT 1');
    $stmt->bindValue(param: ':bike_id', value: $bikeId, type: PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(mode: PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(response_code: 404);
        echo json_encode(value: ['message' => 'Bike not found']);
        exit();
    }
    if ((int)$row['user_id'] !== (int)$user['user_id']) {
        http_response_code(response_code: 403);
        echo json_encode(value: ['message' => 'Forbidden']);
        exit();
    }

    // Prepare upload target
    $baseUploads = dirname(__DIR__, 2) . '/uploads/bikes/';
    if (!is_dir($baseUploads)) {
        if (!mkdir($baseUploads, 0755, true) && !is_dir($baseUploads)) {
            http_response_code(response_code: 500);
            echo json_encode(value: ['message' => 'Unable to prepare upload directory']);
            exit();
        }
    }

    $bikeDir = $baseUploads . $bikeId . '/';
    if (!is_dir($bikeDir)) {
        if (!mkdir($bikeDir, 0755, true) && !is_dir($bikeDir)) {
            http_response_code(response_code: 500);
            echo json_encode(value: ['message' => 'Unable to create bike directory']);
            exit();
        }
    }

    $realBase = realpath($baseUploads);
    $realBikeDir = realpath($bikeDir);
    if ($realBase === false || $realBikeDir === false || strpos($realBikeDir, $realBase) !== 0) {
        http_response_code(response_code: 500);
        echo json_encode(value: ['message' => 'Upload path error']);
        exit();
    }

    // Allowed mime types and corresponding extensions
    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];

    $maxFileSize = 5 * 1024 * 1024; // 5MB per file
    $saved = [];

    // Helper to process a single uploaded file entry
    $processUpload = function ($fileField, int $is_primary = 0) use ($bikeDir, $allowed, $maxFileSize, &$saved, $conn, $bikeId) {
        if (!isset($fileField) || $fileField['error'] === UPLOAD_ERR_NO_FILE) {
            return;
        }

        if (!is_uploaded_file(filename: $fileField['tmp_name'])) {
            throw new RuntimeException('Possible file upload attack');
        }

        if ($fileField['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException('Upload error code: ' . $fileField['error']);
        }

        if ($fileField['size'] > $maxFileSize) {
            throw new RuntimeException('File too large');
        }

        // Validate MIME type using finfo
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($fileField['tmp_name']);
        if (!in_array($mime, array_keys($allowed))) {
            throw new RuntimeException('Unsupported file type: ' . $mime);
        }

        $ext = $allowed[$mime];

        // Generate safe filename
        $basename = bin2hex(random_bytes(8));
        $filename = sprintf('%s.%s', $basename, $ext);

        $destination = $bikeDir . $filename;

        if (!move_uploaded_file($fileField['tmp_name'], $destination)) {
            throw new RuntimeException('Failed to move uploaded file');
        }

        // Insert into images table
        $insert = $conn->prepare(query: 'INSERT INTO images (bike_id, image_name, image_filename, is_primary) VALUES (:bike_id, :image_name, :image_filename, :is_primary)');
        $insert->bindValue(param: ':bike_id', value: $bikeId, type: PDO::PARAM_INT);
        $insert->bindValue(param: ':image_name', value: $fileField['name'], type: PDO::PARAM_STR);
        $insert->bindValue(param: ':image_filename', value: $filename, type: PDO::PARAM_STR);
        $insert->bindValue(param: ':is_primary', value: $is_primary, type: PDO::PARAM_INT);
        if (!$insert->execute()) {
            // cleanup file
            @unlink($destination);
            throw new RuntimeException('Failed to record image in database');
        }

        $saved[] = ['file' => $filename, 'original' => $fileField['name']];
    };

    try {
        // primary_image single file
        if (isset($_FILES['primary_image'])) {
            $processUpload($_FILES['primary_image'], 1);
        }

        // secondary_images[] may be an array
        if (isset($_FILES['secondary_images'])) {
            // if multiple files, PHP makes 'name' an array
            $sec = $_FILES['secondary_images'];
            if (is_array($sec['name'])) {
                for ($i = 0; $i < count($sec['name']); $i++) {
                    $fileEntry = [
                        'name' => $sec['name'][$i],
                        'type' => $sec['type'][$i],
                        'tmp_name' => $sec['tmp_name'][$i],
                        'error' => $sec['error'][$i],
                        'size' => $sec['size'][$i]
                    ];
                    $processUpload($fileEntry);
                }
            } else {
                $processUpload($sec);
            }
        }

        http_response_code(response_code: 200);
        echo json_encode(value: ['message' => 'Upload successful', 'files' => $saved]);
        exit();

    } catch (Throwable $e) {
        http_response_code(response_code: 400);
        echo json_encode(value: ['message' => $e->getMessage()]);
        exit();
    }

} else {

    header(header: "Allow: GET, POST", replace: true, response_code: 405);

}