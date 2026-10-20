"""TaskFlow: servidor de demonstração da disciplina de Desenvolvimento Web Front-End.
Execução: python server.py (Python >= 3.9, sem dependências externas).
A autenticação é destinada apenas a testes acadêmicos e uso local.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import datetime as dt
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import threading

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / 'taskflow.db'
HOST = os.getenv('TASKFLOW_HOST', '127.0.0.1')
PORT = int(os.getenv('TASKFLOW_PORT', '8000'))
SESSIONS = {}
LOCK = threading.RLock()
STATUS = ('Não iniciada', 'Em andamento', 'Concluída')
PRIORITY = ('Baixa', 'Média', 'Alta')


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    derived = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 160000)
    return f'{salt}${derived.hex()}'


def verify_password(password, saved):
    salt = saved.split('$')[0]
    return hmac.compare_digest(saved, password_hash(password, salt))


def connection():
    db = sqlite3.connect(DB_PATH, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    return db


def initialize():
    with connection() as db:
        db.executescript('''
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','membro'))
        );
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'Não iniciada',
          priority TEXT NOT NULL DEFAULT 'Média',
          deadline TEXT, owner_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY(owner_id) REFERENCES users(id)
        );
        ''')
        count = db.execute('SELECT COUNT(*) FROM users').fetchone()[0]
        if not count:
            for name, email, role in [
                ('Lucas Bastos Lustosa', 'lucas@taskflow.local', 'admin'),
                ('Giovana Azevedo', 'giovana@taskflow.local', 'membro'),
            ]:
                db.execute('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)',
                           (name, email, password_hash('Demo@2026'), role))
            seed = [
                ('Planejar interface inicial', 'Definir o fluxo das seis telas do aplicativo.', 'Concluída', 'Alta', '2026-10-17', 1),
                ('Revisar requisitos funcionais', 'Conferir o escopo apresentado no trabalho.', 'Concluída', 'Alta', '2026-10-18', 2),
                ('Validar formulários', 'Conferir mensagens e validações dos campos.', 'Em andamento', 'Média', '2026-10-25', 1),
                ('Testar visualização em celular', 'Avaliar responsividade e navegação por toque.', 'Não iniciada', 'Média', '2026-11-05', 2),
                ('Organizar material de apresentação', 'Separar demonstração e indicadores do projeto.', 'Não iniciada', 'Baixa', '2026-11-10', 2),
            ]
            for title, desc, status, priority, deadline, owner in seed:
                db.execute('''INSERT INTO tasks(title,description,status,priority,deadline,owner_id,created_at)
                              VALUES(?,?,?,?,?,?,?)''',
                           (title, desc, status, priority, deadline, owner, dt.datetime.now().isoformat(timespec='seconds')))


def task_rows(db, where='', params=()):
    query = '''SELECT t.id,t.title,t.description,t.status,t.priority,t.deadline,t.owner_id,
                     t.created_at,u.name AS owner_name FROM tasks t
              JOIN users u ON t.owner_id=u.id ''' + where + ' ORDER BY t.id DESC'
    return [dict(row) for row in db.execute(query, params).fetchall()]


def public_user(row):
    return {k: row[k] for k in ('id', 'name', 'email', 'role')}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print(f'[{self.log_date_time_string()}] {fmt % args}')

    def respond(self, code, data):
        raw = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(raw)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(raw)

    def payload(self):
        try:
            size = int(self.headers.get('Content-Length', 0))
            if size > 100000:
                raise ValueError('Dados enviados são muito grandes.')
            result = json.loads(self.rfile.read(size))
            if not isinstance(result, dict):
                raise ValueError('Informe um objeto JSON.')
            return result
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError) as e:
            raise ValueError('JSON inválido: ' + str(e)) from e

    def get_user(self, db):
        auth = self.headers.get('Authorization', '')
        token = auth.removeprefix('Bearer ').strip() if auth.startswith('Bearer ') else ''
        uid = SESSIONS.get(token)
        return db.execute('SELECT * FROM users WHERE id=?', (uid,)).fetchone() if uid else None

    def validated_task(self, body, db, previous=None):
        def field(name, default=''):
            return body.get(name, previous[name] if previous is not None else default)
        title = str(field('title')).strip()
        if not (3 <= len(title) <= 120):
            raise ValueError('O título deve conter entre 3 e 120 caracteres.')
        desc = str(field('description')).strip()
        if len(desc) > 2000:
            raise ValueError('A descrição deve ter no máximo 2000 caracteres.')
        status = str(field('status', 'Não iniciada'))
        priority = str(field('priority', 'Média'))
        if status not in STATUS or priority not in PRIORITY:
            raise ValueError('Situação ou prioridade inválida.')
        try:
            owner_id = int(field('owner_id'))
        except (ValueError, TypeError):
            raise ValueError('Selecione um responsável válido.')
        if not db.execute('SELECT id FROM users WHERE id=?', (owner_id,)).fetchone():
            raise ValueError('O responsável selecionado não existe.')
        deadline = str(field('deadline') or '').strip() or None
        if deadline:
            try:
                dt.date.fromisoformat(deadline)
            except ValueError:
                raise ValueError('A data de prazo é inválida.')
        return (title, desc, status, priority, deadline, owner_id)

    def route(self, method):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/') or '/'
        if not path.startswith('/api/'):
            if method == 'GET':
                if path in ('/taskflow.db', '/server.py', '/.gitignore') or path.startswith('/.git') or '..' in path:
                    return self.respond(404, {'error': 'Arquivo não disponível.'})
                return super().do_GET()
            return self.respond(404, {'error': 'Rota não encontrada.'})
        segments = path.split('/')[2:]
        try:
            with LOCK, connection() as db:
                if segments == ['login'] and method == 'POST':
                    data = self.payload()
                    email = str(data.get('email', '')).strip().lower()
                    password = str(data.get('password', ''))
                    row = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
                    if not row or not verify_password(password, row['password_hash']):
                        return self.respond(401, {'error': 'E-mail ou senha incorretos.'})
                    token = secrets.token_urlsafe(32)
                    SESSIONS[token] = row['id']
                    return self.respond(200, {'token': token, 'user': public_user(row)})
                user = self.get_user(db)
                if not user:
                    return self.respond(401, {'error': 'Sessão inválida. Entre novamente.'})
                if segments == ['me'] and method == 'GET':
                    return self.respond(200, public_user(user))
                if segments == ['logout'] and method == 'POST':
                    token = self.headers.get('Authorization', '').removeprefix('Bearer ').strip()
                    SESSIONS.pop(token, None)
                    return self.respond(200, {'ok': True})
                if segments == ['users'] and method == 'GET':
                    rows = db.execute('SELECT * FROM users ORDER BY name').fetchall()
                    return self.respond(200, [public_user(r) for r in rows])
                if segments == ['users'] and method == 'POST':
                    if user['role'] != 'admin':
                        return self.respond(403, {'error': 'Somente administradores podem criar usuários.'})
                    body = self.payload()
                    name = str(body.get('name', '')).strip()
                    email = str(body.get('email', '')).lower().strip()
                    password = str(body.get('password', ''))
                    role = str(body.get('role', 'membro'))
                    if len(name) < 3 or '@' not in email or len(password) < 8 or role not in ('admin','membro'):
                        raise ValueError('Informe nome, e-mail, senha com pelo menos 8 caracteres e perfil válido.')
                    try:
                        cur = db.execute('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)',
                                         (name,email,password_hash(password),role))
                    except sqlite3.IntegrityError:
                        return self.respond(409, {'error': 'Já existe um usuário com esse e-mail.'})
                    return self.respond(201, public_user(db.execute('SELECT * FROM users WHERE id=?',(cur.lastrowid,)).fetchone()))
                if segments == ['tasks'] and method == 'GET':
                    return self.respond(200, task_rows(db))
                if segments == ['tasks'] and method == 'POST':
                    values = self.validated_task(self.payload(), db)
                    if user['role'] != 'admin' and values[-1] != user['id']:
                        return self.respond(403, {'error': 'Membros podem cadastrar apenas tarefas próprias.'})
                    cur = db.execute('''INSERT INTO tasks(title,description,status,priority,deadline,owner_id,created_at)
                        VALUES(?,?,?,?,?,?,?)''', (*values, dt.datetime.now().isoformat(timespec='seconds')))
                    return self.respond(201, task_rows(db, 'WHERE t.id=?', (cur.lastrowid,))[0])
                if len(segments)==2 and segments[0]=='tasks' and segments[1].isdigit():
                    task_id = int(segments[1]); found = db.execute('SELECT * FROM tasks WHERE id=?',(task_id,)).fetchone()
                    if not found:
                        return self.respond(404, {'error': 'Tarefa não encontrada.'})
                    if method == 'GET':
                        return self.respond(200, task_rows(db, 'WHERE t.id=?', (task_id,))[0])
                    if user['role'] != 'admin' and found['owner_id'] != user['id']:
                        return self.respond(403, {'error': 'Você não tem permissão para alterar esta tarefa.'})
                    if method == 'PUT':
                        values = self.validated_task(self.payload(), db, found)
                        if user['role'] != 'admin' and values[-1] != user['id']:
                            return self.respond(403, {'error': 'Você não pode transferir sua tarefa.'})
                        db.execute('''UPDATE tasks SET title=?,description=?,status=?,priority=?,deadline=?,owner_id=?
                                      WHERE id=?''', (*values, task_id))
                        return self.respond(200, task_rows(db, 'WHERE t.id=?',(task_id,))[0])
                    if method == 'DELETE':
                        db.execute('DELETE FROM tasks WHERE id=?',(task_id,))
                        return self.respond(200, {'ok': True})
                return self.respond(404, {'error': 'Endpoint não encontrado.'})
        except ValueError as exc:
            return self.respond(400, {'error': str(exc)})
        except Exception as exc:
            print('Erro interno:', repr(exc))
            return self.respond(500, {'error': 'Falha interna no servidor.'})

    def do_GET(self): return self.route('GET')
    def do_POST(self): return self.route('POST')
    def do_PUT(self): return self.route('PUT')
    def do_DELETE(self): return self.route('DELETE')


if __name__ == '__main__':
    initialize()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f'TaskFlow pronto em http://{HOST}:{PORT} (Ctrl+C para encerrar)')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
