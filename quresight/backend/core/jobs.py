import threading
import uuid
import datetime
import traceback
from quresight.backend.db.database import Database

db = Database()

class JobManager:
    @staticmethod
    def create_job(job_type: str) -> str:
        job_id = str(uuid.uuid4())
        job_record = {
            "id": job_id,
            "job_type": job_type,
            "status": "queued",
            "progress": 0.0,
            "result": None,
            "error": None,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
        db.save_job(job_record)
        return job_id

    @staticmethod
    def run_in_background(job_id: str, task_fn, *args, **kwargs):
        def worker():
            try:
                db.update_job(job_id, status="running", progress=10.0)
                # Task function receives a progress callback function
                def progress_cb(pct):
                    db.update_job(job_id, status="running", progress=float(pct))

                result = task_fn(progress_callback=progress_cb, *args, **kwargs)
                db.update_job(job_id, status="completed", progress=100.0, result=result)
            except Exception as e:
                err_msg = f"{str(e)}\n{traceback.format_exc()}"
                db.update_job(job_id, status="failed", progress=100.0, error=err_msg)

        t = threading.Thread(target=worker, daemon=True)
        t.start()

    @staticmethod
    def get_job_status(job_id: str):
        return db.get_job(job_id)
