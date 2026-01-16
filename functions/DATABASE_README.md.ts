# FamilyBudget+ Database Setup Guide

This directory contains database schema and initialization files for deploying FamilyBudget+ with a traditional Flask + SQLite backend.

## 📁 Files Overview

- **`database_schema.sql`** - Complete SQLite database schema with tables, indexes, and triggers
- **`database_seed.sql`** - Sample data for testing and demonstration
- **`init_database.py`** - Python script for database initialization and management
- **`DATABASE_README.md`** - This documentation file

## 🗄️ Database Structure

### Tables

1. **users** - User accounts and authentication
   - `id`, `email`, `full_name`, `role`, timestamps

2. **expenses** - Expense tracking
   - `id`, `title`, `amount`, `category`, `date`, `is_recurring`, `notes`, `created_by`, timestamps
   - Categories: food, rent, transport, education, health, leisure, utilities, clothing, savings, other

3. **incomes** - Income tracking
   - `id`, `title`, `amount`, `date`, `is_recurring`, `notes`, `created_by`, timestamps

4. **budget_goals** - Monthly budget limits
   - `id`, `category`, `monthly_limit`, `alert_threshold`, `month`, `created_by`, timestamps

### Features

- ✅ Foreign key constraints for data integrity
- ✅ Check constraints for data validation
- ✅ Indexes for query performance
- ✅ Triggers for automatic timestamp updates
- ✅ Unique constraints to prevent duplicates

## 🚀 Quick Start

### Option 1: Using Python Script (Recommended)

```bash
# Make script executable (Linux/Mac)
chmod +x init_database.py

# Initialize database with seed data
python3 init_database.py init

# Or run interactively
python3 init_database.py
```

### Option 2: Using SQLite CLI

```bash
# Create database and run schema
sqlite3 familybudget.db < database_schema.sql

# Insert seed data
sqlite3 familybudget.db < database_seed.sql
```

## 📋 Database Commands

### Initialize Database

```bash
# With seed data (includes demo user and sample transactions)
python3 init_database.py init

# Schema only (no sample data)
python3 init_database.py schema-only

# Specify custom database path
python3 init_database.py init /path/to/custom.db
```

### Reset Database

```bash
# Delete and recreate with fresh data
python3 init_database.py reset
```

### Verify Database

```bash
# Check database structure and integrity
python3 init_database.py verify
```

## 🔧 Environment Configuration

Set database path via environment variable:

```bash
# Linux/Mac
export DATABASE_PATH=/path/to/familybudget.db

# Windows
set DATABASE_PATH=C:\path\to\familybudget.db
```

Or configure in Flask `.env` file:

```env
DATABASE_PATH=familybudget.db
```

## 📊 Sample Data

The seed data includes:

- **2 demo users** (regular user and admin)
- **26 sample expenses** across multiple months and categories
- **4 sample incomes** (recurring salary and one-time payments)
- **5 budget goals** for January 2025

### Demo User Credentials

```
Email: demo@familybudget.com
Name: Famille Demo
Role: user
```

## 🔌 Flask Integration

### Example Connection Code

```python
import sqlite3
from flask import g

DATABASE = 'familybudget.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
```

### Example Query

```python
def get_expenses_by_month(month, user_email):
    db = get_db()
    cursor = db.execute('''
        SELECT * FROM expenses 
        WHERE created_by = ? 
        AND strftime('%Y-%m', date) = ?
        ORDER BY date DESC
    ''', (user_email, month))
    return cursor.fetchall()
```

## 🛡️ Security Notes

### For Production Deployment:

1. **Change Demo Credentials**
   - Remove or change demo user passwords
   - Use secure password hashing (bcrypt, argon2)

2. **Database Location**
   - Store database outside web root
   - Use absolute paths with proper permissions
   - Consider PostgreSQL for production

3. **Backup Strategy**
   - Implement regular database backups
   - Use SQLite's backup API or simple file copies
   - Test restoration procedures

4. **Input Validation**
   - Always use parameterized queries
   - Validate all user inputs
   - Implement proper error handling

## 📦 GitHub Deployment

### What to Push to GitHub

```
✅ database_schema.sql    (schema definition)
✅ database_seed.sql      (sample data)
✅ init_database.py       (initialization script)
✅ DATABASE_README.md     (this file)
❌ familybudget.db        (gitignore - created locally)
```

### .gitignore Entry

```gitignore
# SQLite databases
*.db
*.db-journal
*.db-wal
*.db-shm
```

## 🔄 Migration Strategy

### Adding New Columns

```sql
-- Create migration file: migrations/001_add_column.sql
ALTER TABLE expenses ADD COLUMN payment_method TEXT;
```

### Applying Migrations

```bash
sqlite3 familybudget.db < migrations/001_add_column.sql
```

## 🧪 Testing

### Verify Data Integrity

```bash
# Check for orphaned records
sqlite3 familybudget.db "
SELECT COUNT(*) FROM expenses 
WHERE created_by NOT IN (SELECT email FROM users)
"

# Verify indexes
sqlite3 familybudget.db ".indexes"

# Check database size
ls -lh familybudget.db
```

## 📈 Performance Tuning

### Enable WAL Mode (recommended)

```sql
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
```

### Analyze Query Performance

```sql
EXPLAIN QUERY PLAN 
SELECT * FROM expenses WHERE date > '2025-01-01' ORDER BY date DESC;
```

## 🆘 Troubleshooting

### Database Locked Error

```bash
# Check for stale connections
fuser familybudget.db

# Remove journal files
rm familybudget.db-journal
```

### Corrupted Database

```bash
# Check integrity
sqlite3 familybudget.db "PRAGMA integrity_check;"

# Dump and restore
sqlite3 familybudget.db .dump > backup.sql
rm familybudget.db
sqlite3 familybudget.db < backup.sql
```

## 📚 Additional Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [SQLite Best Practices](https://www.sqlite.org/bestpractice.html)

## 🤝 Contributing

When modifying the database schema:

1. Update `database_schema.sql`
2. Create migration script if needed
3. Update this README
4. Test with fresh initialization
5. Update seed data if necessary

## 📞 Support

For issues with database setup:

1. Verify all SQL files are present
2. Check Python version (3.7+)
3. Ensure SQLite3 is installed
4. Review error messages in console

---

**Note:** This database setup is designed for the FamilyBudget+ application. The schema matches the Base44 entity structure for compatibility.