import sqlite3
import json
from pathlib import Path
import datetime

class Database:
    def __init__(self):
        self.db_path = Path(__file__).resolve().parents[2] / "results" / "quresight.db"
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_db()

    def get_conn(self):
        return sqlite3.connect(self.db_path)

    def init_db(self):
        with self.get_conn() as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS experiments (
                    id TEXT PRIMARY KEY,
                    created_at TEXT,
                    dataset_name TEXT,
                    experiment_type TEXT,
                    config TEXT,
                    metrics TEXT,
                    status TEXT,
                    duration_seconds REAL
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS predictions (
                    id TEXT PRIMARY KEY,
                    created_at TEXT,
                    dataset_name TEXT,
                    model_name TEXT,
                    features TEXT,
                    probability REAL,
                    risk_level TEXT,
                    contributions TEXT
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS artifacts (
                    id TEXT PRIMARY KEY,
                    created_at TEXT,
                    artifact_type TEXT,
                    path TEXT,
                    metadata TEXT
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS jobs (
                    id TEXT PRIMARY KEY,
                    job_type TEXT,
                    status TEXT,
                    progress REAL,
                    result TEXT,
                    error TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS reports (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    created_at TEXT,
                    format TEXT,
                    content TEXT
                )
            ''')

    def save_experiment(self, exp_dict):
        with self.get_conn() as conn:
            conn.execute('''
                INSERT INTO experiments (id, created_at, dataset_name, experiment_type, config, metrics, status, duration_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                exp_dict.get('id'),
                exp_dict.get('created_at', datetime.datetime.utcnow().isoformat()),
                exp_dict.get('dataset_name'),
                exp_dict.get('experiment_type'),
                json.dumps(exp_dict.get('config', {})),
                json.dumps(exp_dict.get('metrics', {})),
                exp_dict.get('status'),
                exp_dict.get('duration_seconds')
            ))

    def get_experiments(self, limit=50):
        with self.get_conn() as conn:
            cursor = conn.execute('SELECT * FROM experiments ORDER BY created_at DESC LIMIT ?', (limit,))
            cols = [d[0] for d in cursor.description]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def get_experiment(self, id):
        with self.get_conn() as conn:
            cursor = conn.execute('SELECT * FROM experiments WHERE id = ?', (id,))
            cols = [d[0] for d in cursor.description]
            row = cursor.fetchone()
            return dict(zip(cols, row)) if row else None

    def save_prediction(self, pred_dict):
        with self.get_conn() as conn:
            conn.execute('''
                INSERT INTO predictions (id, created_at, dataset_name, model_name, features, probability, risk_level, contributions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                pred_dict.get('id'),
                pred_dict.get('created_at', datetime.datetime.utcnow().isoformat()),
                pred_dict.get('dataset_name'),
                pred_dict.get('model_name'),
                json.dumps(pred_dict.get('features', {})),
                pred_dict.get('probability'),
                pred_dict.get('risk_level'),
                json.dumps(pred_dict.get('contributions', []))
            ))

    def get_predictions(self, limit=50):
        with self.get_conn() as conn:
            cursor = conn.execute('SELECT * FROM predictions ORDER BY created_at DESC LIMIT ?', (limit,))
            cols = [d[0] for d in cursor.description]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def save_artifact(self, art_dict):
        with self.get_conn() as conn:
            conn.execute('''
                INSERT INTO artifacts (id, created_at, artifact_type, path, metadata)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                art_dict.get('id'),
                art_dict.get('created_at', datetime.datetime.utcnow().isoformat()),
                art_dict.get('artifact_type'),
                art_dict.get('path'),
                json.dumps(art_dict.get('metadata', {}))
            ))

    def save_job(self, job_dict):
        with self.get_conn() as conn:
            conn.execute('''
                INSERT OR REPLACE INTO jobs (id, job_type, status, progress, result, error, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                job_dict.get('id'),
                job_dict.get('job_type'),
                job_dict.get('status', 'queued'),
                job_dict.get('progress', 0.0),
                json.dumps(job_dict.get('result', {})) if job_dict.get('result') else None,
                job_dict.get('error'),
                job_dict.get('created_at', datetime.datetime.utcnow().isoformat()),
                job_dict.get('updated_at', datetime.datetime.utcnow().isoformat())
            ))

    def update_job(self, job_id, status, progress=None, result=None, error=None):
        with self.get_conn() as conn:
            conn.execute('''
                UPDATE jobs
                SET status = ?, progress = COALESCE(?, progress), result = COALESCE(?, result), error = COALESCE(?, error), updated_at = ?
                WHERE id = ?
            ''', (
                status,
                progress,
                json.dumps(result) if result is not None else None,
                error,
                datetime.datetime.utcnow().isoformat(),
                job_id
            ))

    def get_job(self, job_id):
        with self.get_conn() as conn:
            cursor = conn.execute('SELECT * FROM jobs WHERE id = ?', (job_id,))
            cols = [d[0] for d in cursor.description]
            row = cursor.fetchone()
            if not row:
                return None
            res = dict(zip(cols, row))
            if res.get('result'):
                try: res['result'] = json.loads(res['result'])
                except: pass
            return res

    def save_report(self, report_dict):
        with self.get_conn() as conn:
            conn.execute('''
                INSERT OR REPLACE INTO reports (id, title, created_at, format, content)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                report_dict.get('id'),
                report_dict.get('title'),
                report_dict.get('created_at', datetime.datetime.utcnow().isoformat()),
                report_dict.get('format', 'json'),
                report_dict.get('content', '')
            ))

    def get_reports(self, limit=20):
        with self.get_conn() as conn:
            cursor = conn.execute('SELECT id, title, created_at, format FROM reports ORDER BY created_at DESC LIMIT ?', (limit,))
            cols = [d[0] for d in cursor.description]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def get_report_content(self, report_id):
        with self.get_conn() as conn:
            cursor = conn.execute('SELECT * FROM reports WHERE id = ?', (report_id,))
            cols = [d[0] for d in cursor.description]
            row = cursor.fetchone()
            return dict(zip(cols, row)) if row else None

