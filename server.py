#!/usr/bin/env python3
"""
Servidor HTTP simples que serve index.html como página padrão
"""
import http.server
import socketserver
import os

PORT = 3000

class MeuHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Se a requisição for para a raiz, serve index.html
        if self.path == '/':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def end_headers(self):
        # Impedir cache para testes
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

# Mudar para o diretório do servidor
os.chdir('FRONTEND')

with socketserver.TCPServer(("", PORT), MeuHandler) as httpd:
    print(f"🚀 Servidor rodando em http://127.0.0.1:{PORT}")
    print(f"📁 Servindo arquivos de: {os.getcwd()}")
    print(f"Press Ctrl+C para parar")
    httpd.serve_forever()
