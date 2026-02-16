<?php

require_once __DIR__ . "/Config.php";
class Auth
{


    public function __construct(private UserGateway $userGateway, private Jwt $tokenController, private Jwt $refreshController)
    {
    }


    public function authenticateJWTToken(): array | false
    {

        if (!preg_match(pattern: "/^Bearer\s+(.*)$/", subject: $_COOKIE["AUTHORIZATION"], matches: $matches)) {
            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => "incomplete authorization header"]);
            return false;
        }

        try {
            
            $user = $this->tokenController->decode(token: $matches[1]);


        } catch (InvalidSignatureException) {

            http_response_code(response_code: 401);
            echo json_encode(value: ["message" => "invalid signature"]);
            return false;

        } catch (Exception $e) {

            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => $e->getMessage()]);
            return false;
        }

        return $user;
    }

    public function refreshJWTToken(): array | false
    {

        if (!preg_match(pattern: "/^Bearer\s+(.*)$/", subject: $_COOKIE["REFRESH"], matches: $matches)) {
            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => "incomplete authorization header"]);
            return false;
        }

        try {

            $user = $this->refreshController->decode(token: $matches[1]);


        } catch (InvalidSignatureException) {

            http_response_code(response_code: 401);
            echo json_encode(value: ["message" => "invalid signature"]);
            return false;

        }  catch (Exception $e) {

            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => $e->getMessage()]);
            return false;
        }

        $payload = [
            "id" => $user['id'],
            "email" => $user['email'],
            "name" => $user['name'],
            "iss" => "s4513209-ct4034.uogs.co.uk",
            "iat" => time(),
            "exp" => time() + 60 * 15 //15 minutes
        ];

        $token = $this->tokenController->encode(payload: $payload);

        setcookie(
            "AUTHORIZATION",
            "Bearer " . $token,
            ['expires' => $payload['exp'], 'httponly' => true, 'secure' => true, 'samesite' => 'Strict']
        );

        return $user;
    }
}