import http.server
import socketserver
import urllib.request
import ssl
import urllib.parse
import re
import os
import json

PORT = 8080
PROXY_TIMEOUT = 8
DIRECT_ASSET_HOSTS = {'www.str.domains', 'str.domains', 'www.strtalk.net', 'strtalk.net'}
DRIVE_URL = 'https://drive-dev.aresai.tech/'
DRIVE_API_KEY = os.environ.get('DRIVE_API_KEY', '')
DRIVE_USERNAME = os.environ.get('DRIVE_USERNAME', '')
DRIVE_PASSWORD = os.environ.get('DRIVE_PASSWORD', '')

def proxied_url(url):
    return f"/proxy?url={urllib.parse.quote(url, safe='')}"

def origin_for_url(url):
    parsed = urllib.parse.urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}"

def proxy_target_from_referer(referer):
    if not referer:
        return None
    parsed = urllib.parse.urlparse(referer)
    if parsed.path.startswith('/proxy'):
        query = urllib.parse.parse_qs(parsed.query)
        return query.get('url', [None])[0]
    return None

def should_direct_load_assets(base_url):
    return urllib.parse.urlparse(base_url).netloc in DIRECT_ASSET_HOSTS

def asset_url_for(base_url, value):
    absolute = absolutize_url(base_url, value)
    if absolute and absolute.startswith(('http://', 'https://')):
        if urllib.parse.urlparse(base_url).netloc.endswith('shop.strdome.com') and '/static/js/' in absolute:
            return f"{proxied_url(absolute)}&v=shop-router-fix-2"
        if urllib.parse.urlparse(base_url).netloc.endswith('drive-dev.aresai.tech') and '/assets/index-' in absolute and absolute.endswith('.js'):
            return f"{proxied_url(absolute)}&v=drive-router-fix"
        return absolute if should_direct_load_assets(base_url) else proxied_url(absolute)
    return value

def absolutize_url(base_url, value):
    if not value or value.startswith(('data:', 'blob:', 'mailto:', 'tel:', '#')):
        return value
    if value.startswith('/'):
        parsed_base = urllib.parse.urlparse(base_url)
        return f"{parsed_base.scheme}://{parsed_base.netloc}{value}"
    return urllib.parse.urljoin(base_url, value)

def rewrite_web_assets(content, base_url):
    def replace_attr(match):
        attr = match.group(1)
        quote = match.group(2)
        value = match.group(3)
        rewritten = asset_url_for(base_url, value)
        if rewritten != value:
            return f'{attr}={quote}{rewritten}{quote}'
        return match.group(0)

    content = re.sub(
        r'\b(src|href|action|data-proxy-url)=(["\'])((?:https?:)?//[^"\']+|/[^"\']*)\2',
        replace_attr,
        content,
        flags=re.IGNORECASE
    )

    def replace_srcset(match):
        quote = match.group(1)
        entries = []
        for item in match.group(2).split(','):
            parts = item.strip().split()
            if not parts:
                continue
            parts[0] = asset_url_for(base_url, parts[0])
            entries.append(' '.join(parts))
        return f'srcset={quote}{", ".join(entries)}{quote}'

    content = re.sub(r'\bsrcset=(["\'])([^"\']*)\1', replace_srcset, content, flags=re.IGNORECASE)
    return inject_proxy_bridge(content, base_url)

def rewrite_css_assets(content, base_url):
    def replace_url(match):
        quote = match.group(1) or ''
        value = match.group(2).strip()
        rewritten = asset_url_for(base_url, value)
        if rewritten != value:
            return f"url({quote}{rewritten}{quote})"
        return match.group(0)

    return re.sub(r'url\(\s*([\'"]?)(/[^\'")]+)\1\s*\)', replace_url, content, flags=re.IGNORECASE)

def rewrite_js_assets(content, base_url):
    known_hosts = [
        'https://card.ccoin.finance',
        'https://www.ccoin.finance',
        'https://www.str.domains',
        'https://str.domains',
        'https://www.ignitehex.com',
        'https://ignitehex.com',
        'https://drive-dev.aresai.tech',
    ]
    current_origin = origin_for_url(base_url)
    for known_host in known_hosts:
        content = content.replace(known_host, '' if known_host == current_origin else proxied_url(known_host))

    def replace_dynamic_import(match):
        quote = match.group(1)
        value = match.group(2)
        absolute = urllib.parse.urljoin(base_url, value)
        rewritten = absolute if should_direct_load_assets(base_url) else proxied_url(absolute)
        return f"import({quote}{rewritten}{quote})"

    content = re.sub(
        r'import\(\s*(["\'])\.\/([^"\']+)\1\s*\)',
        replace_dynamic_import,
        content
    )

    def replace_static_import(match):
        prefix = match.group(1)
        quote = match.group(2)
        value = match.group(3)
        absolute = urllib.parse.urljoin(base_url, value)
        rewritten = absolute if should_direct_load_assets(base_url) else proxied_url(absolute)
        return f"{prefix}{quote}{rewritten}{quote}"

    content = re.sub(
        r'(\bfrom\s*)(["\'])\.\/([^"\']+)\2',
        replace_static_import,
        content
    )
    content = re.sub(
        r'(\bimport\s*)(["\'])\.\/([^"\']+)\2',
        replace_static_import,
        content
    )

    parsed_base = urllib.parse.urlparse(base_url)
    if parsed_base.netloc.endswith('ignitehex.com'):
        content = content.replace('e.jsxs(cTe,{children:', 'e.jsxs(cTe,{basename:"/proxy",children:')
    if parsed_base.netloc.endswith('shop.strdome.com'):
        content = content.replace('(0,Mt.jsx)(ZA,{children:', '(0,Mt.jsx)(ZA,{basename:"/proxy",children:')
    if parsed_base.netloc.endswith('drive-dev.aresai.tech'):
        content = content.replace('ya({routeTree:sd})', 'ya({routeTree:sd,basepath:"/proxy"})')

    return content

def inject_proxy_bridge(content, base_url):
    origin = origin_for_url(base_url)
    if not origin:
        return content

    bridge = f'''<script>
(function(){{
  var proxyOrigin = {json.dumps(origin)};
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
  function proxify(value){{
    if (!value || typeof value !== "string") return value;
    if (/^(data:|blob:|mailto:|tel:|#)/i.test(value)) return value;
    if (value.indexOf(proxyEndpoint) === 0 || value.indexOf(window.location.origin + proxyEndpoint) === 0) return value;
    var absolute = value;
    try {{
      absolute = new URL(value, proxyOrigin + "/").href;
    }} catch (e) {{
      return value;
    }}
    if (absolute.indexOf(proxyOrigin) === 0) {{
      try {{
        var sameOriginUrl = new URL(absolute);
        return sameOriginUrl.pathname + sameOriginUrl.search + sameOriginUrl.hash;
      }} catch (e) {{
        return value;
      }}
    }}
    for (var i = 0; i < knownHosts.length; i += 1) {{
      if (absolute.indexOf(knownHosts[i]) === 0) {{
        return proxyEndpoint + encodeURIComponent(absolute);
      }}
    }}
    return value;
  }}
  if (window.fetch) {{
    var nativeFetch = window.fetch.bind(window);
    window.fetch = function(input, init) {{
      if (typeof input === "string") return nativeFetch(proxify(input), init);
      if (input && input.url) {{
        try {{
          input = new Request(proxify(input.url), input);
        }} catch (e) {{}}
      }}
      return nativeFetch(input, init);
    }};
  }}
  if (window.XMLHttpRequest) {{
    var nativeOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {{
      arguments[1] = proxify(url);
      return nativeOpen.apply(this, arguments);
    }};
  }}
  if (window.navigator && navigator.sendBeacon) {{
    var nativeBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function(url, data) {{
      return nativeBeacon(proxify(url), data);
    }};
  }}
  document.addEventListener("submit", function(event) {{
    var form = event.target;
    if (form && form.action) form.action = proxify(form.action);
  }}, true);
}})();
</script>'''

    if re.search(r'<head[^>]*>', content, flags=re.IGNORECASE):
        return re.sub(r'<head([^>]*)>', lambda m: f'<head{m.group(1)}>{bridge}', content, count=1, flags=re.IGNORECASE)
    if re.search(r'<body[^>]*>', content, flags=re.IGNORECASE):
        return re.sub(r'<body([^>]*)>', lambda m: f'<body{m.group(1)}>{bridge}', content, count=1, flags=re.IGNORECASE)
    return bridge + content

def drive_access_token():
    payload = json.dumps({
        'username': DRIVE_USERNAME,
        'password': DRIVE_PASSWORD,
    }).encode('utf-8')
    req = urllib.request.Request(
        urllib.parse.urljoin(DRIVE_URL, '/v1/auth/login'),
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'x-api-key': DRIVE_API_KEY,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        method='POST'
    )
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, context=ctx, timeout=PROXY_TIMEOUT) as response:
        data = json.loads(response.read().decode('utf-8'))
        for key in ['accessToken', 'access_token', 'token', 'jwt']:
            if data.get(key):
                return data.get(key)
        for parent in ['data', 'user', 'session']:
            nested = data.get(parent)
            if isinstance(nested, dict):
                for key in ['accessToken', 'access_token', 'token', 'jwt']:
                    if nested.get(key):
                        return nested.get(key)
        return None

def drive_bridge_page(token):
    if not token:
        return b'<!doctype html><title>HostLess Storage</title><p>Unable to connect HostLess Storage.</p>'
    return f'''<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>HostLess Storage</title>
  </head>
  <body style="margin:0;background:#05070f;color:#fff;font-family:Arial,sans-serif;">
    <script>
      localStorage.setItem("drive-token", {json.dumps(token)});
      localStorage.setItem("accessToken", {json.dumps(token)});
      localStorage.setItem("access_token", {json.dumps(token)});
      localStorage.setItem("drive-username", {json.dumps(DRIVE_USERNAME)});
      window.location.replace({json.dumps(proxied_url(DRIVE_URL))});
    </script>
  </body>
</html>'''.encode('utf-8')

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        if self.path.startswith(('/proxy', '/_next', '/assets', '/lovable-uploads')):
            return
        super().log_message(format, *args)

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith('/proxy'):
            query = urllib.parse.parse_qs(parsed.query)
            target_url = query.get('url', [None])[0]
            if target_url:
                self.proxy_request(target_url, method='HEAD')
                return
        referer = self.headers.get('Referer', '')
        target_url = proxy_target_from_referer(referer)
        if not target_url and parsed.path.startswith('/v1/'):
            target_url = DRIVE_URL
        if target_url:
            ref_origin = urllib.parse.urlparse(target_url).scheme + '://' + urllib.parse.urlparse(target_url).netloc
            asset_url = ref_origin + self.path
            if should_direct_load_assets(target_url):
                self.send_response(302)
                self.send_header('Location', asset_url)
                self.send_header('Cache-Control', 'public, max-age=300')
                self.end_headers()
                return
            self.proxy_request(asset_url, method='HEAD')
            return
        return super().do_HEAD()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith('/proxy'):
            query = urllib.parse.parse_qs(parsed.query)
            target_url = query.get('url', [None])[0]
            if target_url:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length) if content_length > 0 else None
                self.proxy_request(target_url, method='POST', data=post_data)
                return

        referer = self.headers.get('Referer', '')
        target_url = proxy_target_from_referer(referer)
        if target_url:
            ref_origin = urllib.parse.urlparse(target_url).scheme + '://' + urllib.parse.urlparse(target_url).netloc
            asset_url = ref_origin + self.path
            if should_direct_load_assets(target_url):
                self.send_response(302)
                self.send_header('Location', asset_url)
                self.send_header('Cache-Control', 'public, max-age=300')
                self.end_headers()
                return
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else None
            self.proxy_request(asset_url, method='POST', data=post_data)
            return

        self.send_response(404)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == '/hostless-storage':
            try:
                body = drive_bridge_page(drive_access_token())
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                body = f"<!doctype html><title>HostLess Storage</title><p>Unable to connect HostLess Storage.</p><!-- {e} -->".encode('utf-8')
                self.send_response(502)
                self.send_header('Content-Type', 'text/html')
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(body)
            return

        if parsed.path.startswith('/v1/'):
            target_url = urllib.parse.urljoin(DRIVE_URL, parsed.path.lstrip('/'))
            if parsed.query:
                target_url += '?' + parsed.query
            self.proxy_request(target_url, method='GET')
            return
        
        # 1. Direct /proxy?url=...
        if parsed.path.startswith('/proxy'):
            query = urllib.parse.parse_qs(parsed.query)
            target_url = query.get('url', [None])[0]
            if target_url:
                self.proxy_request(target_url, method='GET')
            else:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                if self.command != 'HEAD':
                    self.wfile.write(b'')
            return
        
        # 2. Local static dashboard files
        req_path = self.translate_path(self.path)
        if os.path.exists(req_path) and not os.path.isdir(req_path):
            if parsed.path in ['/script.js', '/style.css', '/index.html', '/domedashboard.html']:
                self.send_response(200)
                self.send_header('Content-Type', self.guess_type(req_path))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                if self.command != 'HEAD':
                    with open(req_path, 'rb') as file:
                        self.copyfile(file, self.wfile)
                return
            return super().do_GET()
        if parsed.path in ['/', '/index.html', '/domedashboard.html', '/style.css', '/script.js', '/esim-card.jpg']:
            return super().do_GET()
            
        # 3. Proxy non-local asset & route requests using Referer header
        referer = self.headers.get('Referer', '')
        target_url = proxy_target_from_referer(referer)
        if not target_url and parsed.path.startswith('/v1/'):
            target_url = DRIVE_URL
        if target_url:
            ref_origin = urllib.parse.urlparse(target_url).scheme + '://' + urllib.parse.urlparse(target_url).netloc
            asset_url = ref_origin + self.path
            if should_direct_load_assets(target_url):
                self.send_response(302)
                self.send_header('Location', asset_url)
                self.send_header('Cache-Control', 'public, max-age=300')
                self.end_headers()
                return
            self.proxy_request(asset_url, method='GET')
            return

        return super().do_GET()

    def proxy_request(self, target_url, method='GET', data=None):
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': self.headers.get('Accept', '*/*'),
            }
            target_origin = origin_for_url(target_url)
            if target_origin:
                headers['Origin'] = target_origin
                headers['Referer'] = target_origin + '/'
            if self.headers.get('Content-Type'):
                headers['Content-Type'] = self.headers.get('Content-Type')
            if self.headers.get('Cookie'):
                headers['Cookie'] = self.headers.get('Cookie')
            if self.headers.get('Authorization'):
                headers['Authorization'] = self.headers.get('Authorization')
            if urllib.parse.urlparse(target_url).netloc.endswith('drive-dev.aresai.tech'):
                headers['x-api-key'] = DRIVE_API_KEY

            req = urllib.request.Request(
                target_url,
                data=data,
                headers=headers,
                method=method
            )
            with urllib.request.urlopen(req, context=ctx, timeout=PROXY_TIMEOUT) as response:
                content_type = response.headers.get('Content-Type', 'text/html')
                body = b'' if method == 'HEAD' else response.read()

                if 'text/html' in content_type:
                    html_str = body.decode('utf-8', errors='ignore')
                    
                    # Strip multiline CSP and X-Frame-Options
                    html_str = re.sub(r'<meta[\s\S]*?http-equiv=[\"\']?(Content-Security-Policy|X-Frame-Options)[\"\']?[\s\S]*?>', '', html_str, flags=re.IGNORECASE)
                    html_str = rewrite_web_assets(html_str, target_url)
                    if should_direct_load_assets(target_url):
                        html_str = re.sub(r'<head>', f'<head><base href="{target_url if target_url.endswith("/") else target_url + "/"}">', html_str, count=1, flags=re.IGNORECASE)
                    
                    body = html_str.encode('utf-8')
                elif 'text/css' in content_type:
                    css_str = body.decode('utf-8', errors='ignore')
                    body = rewrite_css_assets(css_str, target_url).encode('utf-8')
                elif 'javascript' in content_type or 'ecmascript' in content_type:
                    js_str = body.decode('utf-8', errors='ignore')
                    body = rewrite_js_assets(js_str, target_url).encode('utf-8')

                self.send_response(response.status)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
                self.send_header('Access-Control-Allow-Headers', '*')
                self.send_header('Access-Control-Allow-Credentials', 'true')
                self.send_header('Cache-Control', 'public, max-age=300')

                # Forward Set-Cookie headers with SameSite=None; Secure
                set_cookies = response.headers.get_all('Set-Cookie') or []
                for cookie in set_cookies:
                    mod_cookie = re.sub(r';\s*SameSite=(Lax|Strict)', '', cookie, flags=re.IGNORECASE)
                    mod_cookie = re.sub(r';\s*Domain=[^;]*', '', mod_cookie, flags=re.IGNORECASE)
                    if 'SameSite=None' not in mod_cookie:
                        mod_cookie += '; SameSite=None; Secure'
                    self.send_header('Set-Cookie', mod_cookie)

                location = response.headers.get('Location')
                if location:
                    self.send_header('Location', proxied_url(absolutize_url(target_url, location)))

                self.end_headers()
                if self.command != 'HEAD':
                    try:
                        self.wfile.write(body)
                    except BrokenPipeError:
                        pass
        except Exception as e:
            try:
                error_body = f"<!-- Proxy Note: {e} -->".encode('utf-8')
                self.send_response(502)
                self.send_header('Content-Type', 'text/html')
                self.send_header('Content-Length', str(len(error_body)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                if self.command != 'HEAD':
                    self.wfile.write(error_body)
            except BrokenPipeError:
                pass

class DashboardServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == '__main__':
    with DashboardServer(("", PORT), ProxyHandler) as httpd:
        print(f"STRDOME Dashboard Full Proxy Server running at http://localhost:{PORT}")
        httpd.serve_forever()
