<?php

require_once __DIR__ . "/Config.php";
class Auth
{


    public function __construct(private UserGateway $userGateway, private Jwt $tokenController, private Jwt $refreshController)
    {
    }


    public function authenticateJWTToken(): array
    {

        if (!preg_match(pattern: "/^Bearer\s+(.*)$/", subject: $_COOKIE["AUTHORIZATION"], matches: $matches)) {
            
            http_response_code(response_code: 401);
            echo json_encode(value: ["message" => "Invalid access token"]);
            exit();
        }

        try {
            
            $user = $this->tokenController->decode(token: $matches[1]);

        } catch (InvalidSignatureException) {

            http_response_code(response_code: 401);
            echo json_encode(value: ["message" => "Invalid access token"]);
            exit();

        } catch (ExpiredTokenException) {
        
            http_response_code(response_code: 401);
            echo json_encode(value: ["message" => "Access token expired"]);
            exit();

        }catch (Exception $e) {

            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => $e->getMessage()]);
            exit();
        }

        return $user;
    }

    public function refreshJWTToken(): string
    {

        if (!preg_match(pattern: "/^Bearer\s+(.*)$/", subject: $_COOKIE["REFRESH"], matches: $matches)) {

            http_response_code(response_code: 401);
            echo json_encode(value: ["message" => "Invalid access token"]);
            exit();
        }

        try {

            $user = $this->refreshController->decode(token: $matches[1]);


        } catch (InvalidSignatureException) {

            http_response_code(response_code: 401);
            echo json_encode(value: ["message" => "Invalid refresh token"]);
            exit();

        } catch (ExpiredTokenException) {

            http_response_code(response_code: 401);
            echo json_encode(value: ["message" => "Refresh token expired"]);
            exit();

        } catch (Exception $e) {

            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => $e->getMessage()]);
            exit();
        }

        $payload = [
            "user_id" => $user['user_id'],
            "email" => $user['email'],
            "name" => $user['name'],
            "type" => $user['type'],
            "iss" => "s4513209-ctxxxx.uogs.co.uk",
            "iat" => time(),
            "exp" => time() + $_ENV['ACCESS_TTL']
        ];

        $token = $this->tokenController->encode(payload: $payload);

        return $token;
    }
}