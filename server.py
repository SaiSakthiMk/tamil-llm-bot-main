#!/usr/bin/env python3
"""
Simple local server for the SkillCraft Technology Verify clone.
Serves static assets and provides the `/.netlify/functions/verify` API endpoint.
"""

import http.server
import socketserver
import urllib.parse
import json
import os
import urllib.request

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class VerifyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        # Handle API endpoint: /.netlify/functions/verify?id=...
        if path == '/.netlify/functions/verify' or path == '/api/verify':
            cert_id = query.get('id', [''])[0].strip()
            
            # Check local database
            data = None
            db_path = os.path.join(BASE_DIR, 'data', 'certificates.json')
            if os.path.exists(db_path):
                try:
                    with open(db_path, 'r', encoding='utf-8') as f:
                        certs = json.load(f)
                        data = certs.get(cert_id) or certs.get(cert_id.upper())
                except Exception as e:
                    print(f"Error reading local database: {e}")

            # If not in local database, attempt upstream proxy
            if not data:
                try:
                    upstream_url = f"https://skillcrafttech.com/.netlify/functions/verify?id={urllib.parse.quote(cert_id)}"
                    req = urllib.request.Request(upstream_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=5) as resp:
                        if resp.status == 200:
                            data = json.loads(resp.read().decode('utf-8'))
                except Exception as e:
                    print(f"Upstream fetch failed: {e}")

            if data:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode('utf-8'))
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Certificate not found"}).encode('utf-8'))
            return

        # Route /verify or / to index.html
        if path in ('/verify', '/verify/'):
            self.path = '/index.html'

        return super().do_GET()

if __name__ == '__main__':
    os.chdir(BASE_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), VerifyHandler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        print(f"Direct link to verification: http://localhost:{PORT}/index.html?id=SCT/JUN26/2924")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
