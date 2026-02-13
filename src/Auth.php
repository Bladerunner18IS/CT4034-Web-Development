<?php

class Auth
{


    public function __construct(private UserGateway $userGateway, private Jwt $jwtCtrl)
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
            $data = $this->jwtCtrl->decode(token: $matches[1]);
            if (time() > $data['exp']) {
                http_response_code(response_code: 401);
                echo json_encode(value: ["message" => "Auth token expired"]);
                return false;
            }

        } catch (InvalidSignatureException) {

            http_response_code(response_code: 401);
            echo json_encode(value: ["message" => "invalid signature"]);
            return false;
        } catch (Exception $e) {

            http_response_code(response_code: 400);
            echo json_encode(value: ["message" => $e->getMessage()]);
            return false;
        }

        return $data;
    }
}