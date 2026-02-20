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
            
            return false;
        }

        try {
            
            $user = $this->tokenController->decode(token: $matches[1]);


        } catch (InvalidSignatureException) {

            return false;

        } catch (Exception $e) {

            return false;
        }

        return $user;
    }

    public function refreshJWTToken(): array | false
    {

        if (!preg_match(pattern: "/^Bearer\s+(.*)$/", subject: $_COOKIE["REFRESH"], matches: $matches)) {

            return false;
        }

        try {

            $user = $this->refreshController->decode(token: $matches[1]);


        } catch (InvalidSignatureException) {

            return false;

        }  catch (Exception $e) {

            return false;
        }

        $payload = [
            "user_id" => $user['user_id'],
            "email" => $user['email'],
            "name" => $user['name'],
            "type" => $user['type'],
            "iss" => "s4513209-ctxxxx.uogs.co.uk",
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