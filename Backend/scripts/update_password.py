import sqlite3
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.security import hash_password

db_path = os.path.join(os.path.dirname(__file__), "..", "quresight.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()
p_hash = hash_password("Password@123")
c.execute(
    "UPDATE users SET password_hash=?, is_email_verified=1, full_name='P Rushidhar', username='prushidhar' WHERE email='prushidhar@gmail.com'",
    (p_hash,),
)
conn.commit()
print("Successfully set password for prushidhar@gmail.com to: Password@123")
