<?php

require_once __DIR__ . '/exceptions/ExpiredTokenException.php';
class Jwt
{

    public function __construct(private string $key)
    {

    }

    public function encode(array $payload): string
    {

        $header = json_encode(value: [
            "alg" => "HS256",
            "typ" => "JWT"
        ]);

        $header = $this->base64URLEncode(text: $header);
        $payload = json_encode(value: $payload);
        $payload = $this->base64URLEncode(text: $payload);

        $signature = hash_hmac(algo: "sha256", data: $header . "." . $payload, key: $this->key, binary: true);
        $signature = $this->base64URLEncode(text: $signature);
        return $header . "." . $payload . "." . $signature;
    }

    public function decode(string $token): array
    {
        if (
            preg_match(
                pattern: "/^(?<header>.+)\.(?<payload>.+)\.(?<signature>.+)$/",
                subject: $token,
                matches: $matches
            ) !== 1
        ) {

            throw new InvalidArgumentException(message: "Invalid token format");
        }

        $signature = hash_hmac(
            algo: "sha256",
            data: $matches["header"] . "." . $matches["payload"],
            key: $this->key,
            binary: true
        );

        $signature_from_token = $this->base64URLDecode(text: $matches["signature"]);

        if (!hash_equals(known_string: $signature, user_string: $signature_from_token)) {

            throw new InvalidSignatureException;
        }

        $payload = json_decode(json: $this->base64URLDecode(text: $matches["payload"]), associative: true);

        if (time() > $payload['exp']) {

            throw new ExpiredTokenException();
        }
        return $payload;
    }


    private function base64URLEncode(string $text): string
    {

        return str_replace(search: ['+', '/', '='], replace: ['-', '_', ''], subject: base64_encode(string: $text));
    }

    private function base64URLDecode(string $text): string
    {
        return base64_decode(
            string: str_replace(
                search: ["-", "_"],
                replace: ["+", "/"],
                subject: $text
            )
        );
    }
}