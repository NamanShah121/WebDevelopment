import pandas as pd
import sqlite3
import os

# Load the Excel data
excel_file = 'engineering colleges in India.xlsx'
df = pd.read_excel(excel_file)

# Clean up columns (remove Unnamed ones)
df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

# Rename columns to be SQL-friendly
df.columns = [c.replace(' ', '_').lower() for c in df.columns]

# Create/Connect to SQLite database
db_path = 'colleges.db'
if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)

# Import data to SQL
df.to_sql('colleges', conn, index=False)

# Add an ID column if it doesn't exist
cursor = conn.cursor()
cursor.execute("CREATE TABLE colleges_new AS SELECT rowid as id, * FROM colleges")
cursor.execute("DROP TABLE colleges")
cursor.execute("ALTER TABLE colleges_new RENAME TO colleges")

conn.commit()
conn.close()

print(f"Successfully imported {len(df)} colleges into {db_path}")
