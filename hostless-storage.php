<?php
declare(strict_types=1);

const DRIVE_URL = 'https://drive-dev.aresai.tech/';
const DRIVE_API_KEY = 'sldrv_live_2d690871ec0e_og2CGeL59ExGwJnMY_5JCJ8gHrwtoqiYEfzmLmGlLr8';
const DRIVE_USERNAME = 'test-cla';
const DRIVE_PASSWORD = 'paroladetest!@#$%^&*()';

function proxied_url(string $url): string {
    return '/proxy?url=' . rawurlencode($url);
}

function drive_access_token(): ?string {
    if (!function_exists('curl_init')) return null;

    $payload = json_encode([
        'username' => DRIVE_USERNAME,
        'password' => DRIVE_PASSWORD,
    ]);

    $ch = curl_init(DRIVE_URL . 'v1/auth/login');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'x-api-key: ' . DRIVE_API_KEY,
            'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ],
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    $data = is_string($response) ? json_decode($response, true) : null;
    if (!is_array($data)) return null;

    foreach (['accessToken', 'access_token', 'token', 'jwt'] as $key) {
        if (isset($data[$key]) && is_string($data[$key]) && $data[$key] !== '') return $data[$key];
    }
    foreach (['data', 'user', 'session'] as $parent) {
        if (!isset($data[$parent]) || !is_array($data[$parent])) continue;
        foreach (['accessToken', 'access_token', 'token', 'jwt'] as $key) {
            if (isset($data[$parent][$key]) && is_string($data[$parent][$key]) && $data[$parent][$key] !== '') {
                return $data[$parent][$key];
            }
        }
    }

    return null;
}

$token = drive_access_token();
if (!$token) {
    http_response_code(502);
    echo '<!doctype html><title>HostLess Storage</title><p>Unable to connect HostLess Storage.</p>';
    exit;
}
?>
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>HostLess Storage</title>
  </head>
  <body style="margin:0;background:#05070f;color:#fff;font-family:Arial,sans-serif;">
    <script>
      localStorage.setItem("drive-token", <?= json_encode($token) ?>);
      localStorage.setItem("accessToken", <?= json_encode($token) ?>);
      localStorage.setItem("access_token", <?= json_encode($token) ?>);
      localStorage.setItem("drive-username", <?= json_encode(DRIVE_USERNAME) ?>);
      window.location.replace(<?= json_encode(proxied_url(DRIVE_URL)) ?>);
    </script>
  </body>
</html>
