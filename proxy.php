<?php
declare(strict_types=1);

const PROXY_TIMEOUT = 12;
const DIRECT_ASSET_HOSTS = ['www.str.domains', 'str.domains', 'www.strtalk.net', 'strtalk.net'];
const PROXY_ORIGIN_COOKIE = '__dome_proxy_origin';
const DRIVE_API_KEY = 'sldrv_live_2d690871ec0e_og2CGeL59ExGwJnMY_5JCJ8gHrwtoqiYEfzmLmGlLr8';

if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool {
        return $needle === '' || strpos($haystack, $needle) === 0;
    }
}

if (!function_exists('str_ends_with')) {
    function str_ends_with(string $haystack, string $needle): bool {
        return $needle === '' || substr($haystack, -strlen($needle)) === $needle;
    }
}

if (!function_exists('str_contains')) {
    function str_contains(string $haystack, string $needle): bool {
        return $needle === '' || strpos($haystack, $needle) !== false;
    }
}

function proxied_url(string $url): string {
    return '/proxy?url=' . rawurlencode($url);
}

function js_string(string $value): string {
    return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

function origin_for_url(string $url): ?string {
    $parts = parse_url($url);
    if (!$parts || empty($parts['scheme']) || empty($parts['host'])) return null;
    return $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
}

function proxy_cookie_suffix(): string {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? '; Secure' : '';
    return '; Path=/; SameSite=Lax' . $secure;
}

function request_header_value(string $name): ?string {
    $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    foreach ([$serverKey, 'REDIRECT_' . $serverKey, $name] as $key) {
        if (!empty($_SERVER[$key]) && is_string($_SERVER[$key])) return $_SERVER[$key];
    }
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $headerName => $value) {
            if (strcasecmp((string)$headerName, $name) === 0 && is_string($value) && $value !== '') return $value;
        }
    }
    return null;
}

function starts_with_any(string $value, array $prefixes): bool {
    foreach ($prefixes as $prefix) {
        if (str_starts_with($value, $prefix)) return true;
    }
    return false;
}

function absolutize_url(string $baseUrl, string $value): string {
    if ($value === '' || starts_with_any($value, ['data:', 'blob:', 'mailto:', 'tel:', '#'])) return $value;
    if (preg_match('#^https?://#i', $value)) return $value;

    $base = parse_url($baseUrl);
    if (!$base || empty($base['scheme']) || empty($base['host'])) return $value;
    $origin = $base['scheme'] . '://' . $base['host'] . (isset($base['port']) ? ':' . $base['port'] : '');

    if (str_starts_with($value, '/')) return $origin . $value;

    $path = $base['path'] ?? '/';
    $dir = preg_replace('#/[^/]*$#', '/', $path);
    return $origin . $dir . $value;
}

function should_direct_load_assets(string $baseUrl): bool {
    $host = parse_url($baseUrl, PHP_URL_HOST) ?: '';
    return in_array($host, DIRECT_ASSET_HOSTS, true);
}

function asset_url_for(string $baseUrl, string $value): string {
    if (str_starts_with($value, '//')) $value = 'https:' . $value;
    $absolute = absolutize_url($baseUrl, $value);
    if (!preg_match('#^https?://#i', $absolute)) return $value;

    $host = parse_url($baseUrl, PHP_URL_HOST) ?: '';
    if (str_ends_with($host, 'shop.strdome.com') && str_contains($absolute, '/static/js/')) {
        return proxied_url($absolute) . '&v=shop-router-fix-2';
    }
    if (str_ends_with($host, 'drive-dev.aresai.tech') && str_contains($absolute, '/assets/index-') && str_ends_with($absolute, '.js')) {
        return proxied_url($absolute) . '&v=drive-router-fix';
    }

    return should_direct_load_assets($baseUrl) ? $absolute : proxied_url($absolute);
}

function rewrite_web_assets(string $content, string $baseUrl): string {
    $content = preg_replace_callback(
        '/\b(src|href|action|data-proxy-url)=(["\'])((?:https?:)?\/\/[^"\']+|\/[^"\']*)\2/i',
        fn($m) => $m[1] . '=' . $m[2] . asset_url_for($baseUrl, $m[3]) . $m[2],
        $content
    );

    $content = preg_replace_callback('/\bsrcset=(["\'])([^"\']*)\1/i', function ($m) use ($baseUrl) {
        $entries = [];
        foreach (explode(',', $m[2]) as $item) {
            $parts = preg_split('/\s+/', trim($item));
            if (!$parts || $parts[0] === '') continue;
            $parts[0] = asset_url_for($baseUrl, $parts[0]);
            $entries[] = implode(' ', $parts);
        }
        return 'srcset=' . $m[1] . implode(', ', $entries) . $m[1];
    }, $content);

    return inject_proxy_bridge($content, $baseUrl);
}

function rewrite_css_assets(string $content, string $baseUrl): string {
    return preg_replace_callback('/url\(\s*([\'"]?)(\/[^\'")]+)\1\s*\)/i', function ($m) use ($baseUrl) {
        return 'url(' . ($m[1] ?? '') . asset_url_for($baseUrl, trim($m[2])) . ($m[1] ?? '') . ')';
    }, $content);
}

function rewrite_js_assets(string $content, string $baseUrl): string {
    $knownHosts = [
        'https://card.ccoin.finance',
        'https://www.ccoin.finance',
        'https://www.str.domains',
        'https://str.domains',
        'https://www.ignitehex.com',
        'https://ignitehex.com',
        'https://drive-dev.aresai.tech',
    ];
    foreach ($knownHosts as $knownHost) {
        $content = str_replace($knownHost, $knownHost === origin_for_url($baseUrl) ? '' : proxied_url($knownHost), $content);
    }

    $content = preg_replace_callback('/import\(\s*(["\'])\.\/([^"\']+)\1\s*\)/', function ($m) use ($baseUrl) {
        $absolute = absolutize_url($baseUrl, $m[2]);
        $rewritten = should_direct_load_assets($baseUrl) ? $absolute : proxied_url($absolute);
        return 'import(' . $m[1] . $rewritten . $m[1] . ')';
    }, $content);

    $content = preg_replace_callback('/(\bfrom\s*)(["\'])\.\/([^"\']+)\2/', function ($m) use ($baseUrl) {
        $absolute = absolutize_url($baseUrl, $m[3]);
        $rewritten = should_direct_load_assets($baseUrl) ? $absolute : proxied_url($absolute);
        return $m[1] . $m[2] . $rewritten . $m[2];
    }, $content);

    $content = preg_replace_callback('/(\bimport\s*)(["\'])\.\/([^"\']+)\2/', function ($m) use ($baseUrl) {
        $absolute = absolutize_url($baseUrl, $m[3]);
        $rewritten = should_direct_load_assets($baseUrl) ? $absolute : proxied_url($absolute);
        return $m[1] . $m[2] . $rewritten . $m[2];
    }, $content);

    $host = parse_url($baseUrl, PHP_URL_HOST) ?: '';
    if (str_ends_with($host, 'ignitehex.com')) {
        $content = str_replace('e.jsxs(cTe,{children:', 'e.jsxs(cTe,{basename:"/proxy",children:', $content);
    }
    if (str_ends_with($host, 'shop.strdome.com')) {
        $content = str_replace('(0,Mt.jsx)(ZA,{children:', '(0,Mt.jsx)(ZA,{basename:"/proxy",children:', $content);
    }
    if (str_ends_with($host, 'drive-dev.aresai.tech')) {
        $content = str_replace('ya({routeTree:sd})', 'ya({routeTree:sd,basepath:"/proxy"})', $content);
    }

    return $content;
}

function inject_proxy_bridge(string $content, string $baseUrl): string {
    $origin = origin_for_url($baseUrl);
    if (!$origin) return $content;

    $bridge = '<script>
(function(){
  var proxyOrigin = ' . js_string($origin) . ';
  var proxyEndpoint = "/proxy?url=";
  var knownHosts = [
    "https://card.ccoin.finance",
    "https://www.ccoin.finance",
    "https://www.str.domains",
    "https://str.domains",
    "https://www.ignitehex.com",
    "https://ignitehex.com",
    "https://drive-dev.aresai.tech"
  ];
  function proxify(value){
    if (!value || typeof value !== "string") return value;
    if (/^(data:|blob:|mailto:|tel:|#)/i.test(value)) return value;
    if (value.indexOf(proxyEndpoint) === 0 || value.indexOf(window.location.origin + proxyEndpoint) === 0) return value;
    var absolute = value;
    try {
      absolute = new URL(value, proxyOrigin + "/").href;
    } catch (e) {
      return value;
    }
    if (absolute.indexOf(proxyOrigin) === 0) {
      try {
        var sameOriginUrl = new URL(absolute);
        return sameOriginUrl.pathname + sameOriginUrl.search + sameOriginUrl.hash;
      } catch (e) {
        return value;
      }
    }
    for (var i = 0; i < knownHosts.length; i += 1) {
      if (absolute.indexOf(knownHosts[i]) === 0) {
        return proxyEndpoint + encodeURIComponent(absolute);
      }
    }
    return value;
  }
  if (window.fetch) {
    var nativeFetch = window.fetch.bind(window);
    window.fetch = function(input, init) {
      if (typeof input === "string") return nativeFetch(proxify(input), init);
      if (input && input.url) {
        try {
          input = new Request(proxify(input.url), input);
        } catch (e) {}
      }
      return nativeFetch(input, init);
    };
  }
  if (window.XMLHttpRequest) {
    var nativeOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
      arguments[1] = proxify(url);
      return nativeOpen.apply(this, arguments);
    };
  }
  if (window.navigator && navigator.sendBeacon) {
    var nativeBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function(url, data) {
      return nativeBeacon(proxify(url), data);
    };
  }
  document.addEventListener("submit", function(event) {
    var form = event.target;
    if (form && form.action) form.action = proxify(form.action);
  }, true);
})();
</script>';

    if (stripos($content, '<head') !== false) {
        return preg_replace('/<head([^>]*)>/i', '<head$1>' . $bridge, $content, 1);
    }
    if (stripos($content, '<body') !== false) {
        return preg_replace('/<body([^>]*)>/i', '<body$1>' . $bridge, $content, 1);
    }
    return $bridge . $content;
}

function target_from_referer(): ?string {
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $cookieTarget = !empty($_COOKIE[PROXY_ORIGIN_COOKIE]) ? rawurldecode((string)$_COOKIE[PROXY_ORIGIN_COOKIE]) : '';
    if ($referer !== '') {
        $parts = parse_url($referer);
        if ($parts && !empty($parts['path']) && str_starts_with($parts['path'], '/proxy')) {
            parse_str($parts['query'] ?? '', $query);
            if (isset($query['url']) && is_string($query['url'])) return $query['url'];
            if ($cookieTarget !== '' && preg_match('#^https?://#i', $cookieTarget)) {
                return $cookieTarget;
            }
        }
    }

    if ($cookieTarget !== '' && preg_match('#^https?://#i', $cookieTarget)) {
        return $cookieTarget;
    }

    return null;
}

function inferred_target_url(): ?string {
    if (isset($_GET['url']) && is_string($_GET['url']) && preg_match('#^https?://#i', $_GET['url'])) {
        return $_GET['url'];
    }

    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $refererTarget = target_from_referer();
    if (!$refererTarget && str_starts_with($uri, '/v1/')) {
        $refererTarget = 'https://drive-dev.aresai.tech';
    }
    if (!$refererTarget) return null;

    $origin = origin_for_url($refererTarget);
    if (!$origin) return null;
    if (str_starts_with($uri, '/proxy/')) {
        $uri = substr($uri, strlen('/proxy'));
    }
    if ($uri === '/proxy') $uri = '/';
    return $origin . $uri;
}

function fetch_remote(string $url, string $method, string $body): array {
    if (!function_exists('curl_init')) {
        return [502, 'text/html', '<!-- Proxy Note: PHP cURL extension is not enabled on this hosting account. -->', []];
    }

    $headers = [
        'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept: ' . ($_SERVER['HTTP_ACCEPT'] ?? '*/*'),
    ];
    $origin = origin_for_url($url);
    if ($origin) {
        $headers[] = 'Origin: ' . $origin;
        $headers[] = 'Referer: ' . $origin . '/';
    }
    if (!empty($_SERVER['CONTENT_TYPE'])) $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
    if (!empty($_SERVER['HTTP_COOKIE'])) {
        $cookies = array_filter(array_map('trim', explode(';', $_SERVER['HTTP_COOKIE'])), function ($cookie) {
            return !str_starts_with($cookie, PROXY_ORIGIN_COOKIE . '=');
        });
        if ($cookies) $headers[] = 'Cookie: ' . implode('; ', $cookies);
    }
    $authorization = request_header_value('Authorization');
    if ($authorization) $headers[] = 'Authorization: ' . $authorization;
    if (str_ends_with(parse_url($url, PHP_URL_HOST) ?: '', 'drive-dev.aresai.tech')) {
        $headers[] = 'x-api-key: ' . DRIVE_API_KEY;
    }

    $responseHeaders = [];
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => PROXY_TIMEOUT,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_HEADERFUNCTION => function ($ch, $header) use (&$responseHeaders) {
            $responseHeaders[] = trim($header);
            return strlen($header);
        },
    ]);
    if (!in_array($method, ['GET', 'HEAD'], true)) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    if ($method === 'HEAD') curl_setopt($ch, CURLOPT_NOBODY, true);

    $content = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE) ?: 502;
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'text/html';
    if ($content === false) $content = '<!-- Proxy Note: ' . htmlspecialchars(curl_error($ch), ENT_QUOTES) . ' -->';
    curl_close($ch);

    return [$status, $contentType, (string)$content, $responseHeaders];
}

$targetUrl = inferred_target_url();
if (!$targetUrl) {
    http_response_code(404);
    header('Content-Type: text/html');
    echo '<!doctype html><title>Proxy</title><p>Missing proxy target.</p>';
    exit;
}

$targetOrigin = origin_for_url($targetUrl);
if ($targetOrigin) {
    header('Set-Cookie: ' . PROXY_ORIGIN_COOKIE . '=' . rawurlencode($targetOrigin) . proxy_cookie_suffix(), false);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: *');
    exit;
}

[$status, $contentType, $content, $responseHeaders] = fetch_remote($targetUrl, $method, file_get_contents('php://input') ?: '');

if (stripos($contentType, 'text/html') !== false) {
    $content = preg_replace('/<meta[\s\S]*?http-equiv=["\']?(Content-Security-Policy|X-Frame-Options)["\']?[\s\S]*?>/i', '', $content);
    $content = rewrite_web_assets($content, $targetUrl);
} elseif (stripos($contentType, 'text/css') !== false) {
    $content = rewrite_css_assets($content, $targetUrl);
} elseif (stripos($contentType, 'javascript') !== false || stripos($contentType, 'ecmascript') !== false) {
    $content = rewrite_js_assets($content, $targetUrl);
}

http_response_code($status);
header('Content-Type: ' . $contentType);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: public, max-age=300');

foreach ($responseHeaders as $header) {
    if (stripos($header, 'Set-Cookie:') === 0) {
        $cookie = preg_replace('/;\s*SameSite=(Lax|Strict)/i', '', substr($header, 11));
        $cookie = preg_replace('/;\s*Domain=[^;]*/i', '', $cookie);
        if (stripos($cookie, 'SameSite=None') === false) $cookie .= '; SameSite=None; Secure';
        header('Set-Cookie: ' . $cookie, false);
    }
}

if ($method !== 'HEAD') echo $content;
