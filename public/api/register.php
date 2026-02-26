<?php
declare(strict_types=1);

require_once dirname(path: __DIR__, levels: 2) . "/src/Config.php";


if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $sql = "INSERT INTO users (email, name, password_hash)
            VALUES (:email, :name, :password_hash)";

    $statement = $conn->prepare(query: $sql);

    $password_hash = password_hash(password: $_POST["password"], algo: PASSWORD_BCRYPT);


    $statement->bindValue(param: ":email", value: $_POST["email"], type: PDO::PARAM_STR);
    $statement->bindValue(param: ":name", value: $_POST["name"], type: PDO::PARAM_STR);
    $statement->bindValue(param: ":password_hash", value: $password_hash, type: PDO::PARAM_STR);

    $statement->execute();

    echo "Successfully registered!";
    exit;
}

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Public Registration</title>
    <link rel="stylesheet" href="../style.css">
</head>

<body>
    <div class="container">
        <h2>Public Registration</h2>
        <form action="register.php" method="post">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="text" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
                <input type="submit" value="Register">
            </div>
        </form>
    </div>
</body>

</html>