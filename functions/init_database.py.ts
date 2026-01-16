#!/usr/bin/env python3
"""
FamilyBudget+ Database Initialization Script
Initializes SQLite database with schema and seed data
"""

import sqlite3
import os
import sys
from datetime import datetime

def get_db_path():
    """Get database path from environment or use default"""
    return os.environ.get('DATABASE_PATH', 'familybudget.db')

def init_database(db_path=None, seed_data=True):
    """
    Initialize the database with schema and optionally seed data
    
    Args:
        db_path: Path to SQLite database file
        seed_data: Whether to insert sample data
    """
    if db_path is None:
        db_path = get_db_path()
    
    print(f"🔧 Initializing database at: {db_path}")
    
    # Check if database already exists
    db_exists = os.path.exists(db_path)
    if db_exists:
        response = input("⚠️  Database already exists. Recreate? (y/N): ")
        if response.lower() != 'y':
            print("❌ Initialization cancelled")
            return False
        os.remove(db_path)
        print("🗑️  Existing database removed")
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Read and execute schema
        print("📋 Creating database schema...")
        schema_path = os.path.join(os.path.dirname(__file__), 'database_schema.sql')
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        cursor.executescript(schema_sql)
        conn.commit()
        print("✅ Schema created successfully")
        
        # Insert seed data if requested
        if seed_data:
            print("🌱 Inserting seed data...")
            seed_path = os.path.join(os.path.dirname(__file__), 'database_seed.sql')
            with open(seed_path, 'r', encoding='utf-8') as f:
                seed_sql = f.read()
            
            cursor.executescript(seed_sql)
            conn.commit()
            print("✅ Seed data inserted successfully")
        
        # Verify tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"\n📊 Tables created: {', '.join([t[0] for t in tables if t[0] != 'sqlite_sequence'])}")
        
        # Count records
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM expenses")
        expense_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM incomes")
        income_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM budget_goals")
        goal_count = cursor.fetchone()[0]
        
        print(f"\n📈 Records inserted:")
        print(f"   - Users: {user_count}")
        print(f"   - Expenses: {expense_count}")
        print(f"   - Incomes: {income_count}")
        print(f"   - Budget Goals: {goal_count}")
        
        conn.close()
        print(f"\n🎉 Database initialized successfully at {db_path}")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ SQLite error: {e}")
        return False
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
        print("   Make sure database_schema.sql and database_seed.sql are in the same directory")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def reset_database(db_path=None):
    """Reset database to initial state with seed data"""
    if db_path is None:
        db_path = get_db_path()
    
    if os.path.exists(db_path):
        os.remove(db_path)
    
    return init_database(db_path, seed_data=True)

def verify_database(db_path=None):
    """Verify database structure and integrity"""
    if db_path is None:
        db_path = get_db_path()
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"🔍 Verifying database: {db_path}")
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cursor.fetchall() if t[0] != 'sqlite_sequence']
        expected_tables = ['users', 'expenses', 'incomes', 'budget_goals']
        
        print(f"\n📊 Tables found: {len(tables)}")
        for table in expected_tables:
            if table in tables:
                print(f"   ✅ {table}")
            else:
                print(f"   ❌ {table} (missing)")
        
        # Check indexes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'")
        indexes = cursor.fetchall()
        print(f"\n📇 Indexes: {len(indexes)}")
        
        # Check triggers
        cursor.execute("SELECT name FROM sqlite_master WHERE type='trigger'")
        triggers = cursor.fetchall()
        print(f"⚡ Triggers: {len(triggers)}")
        
        conn.close()
        print("\n✅ Database verification complete")
        return True
        
    except Exception as e:
        print(f"❌ Error verifying database: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        db_path = sys.argv[2] if len(sys.argv) > 2 else None
        
        if command == "init":
            init_database(db_path, seed_data=True)
        elif command == "reset":
            reset_database(db_path)
        elif command == "verify":
            verify_database(db_path)
        elif command == "schema-only":
            init_database(db_path, seed_data=False)
        else:
            print("❌ Unknown command. Use: init, reset, verify, or schema-only")
    else:
        # Interactive mode
        print("=" * 60)
        print("   FamilyBudget+ Database Initialization")
        print("=" * 60)
        print("\nOptions:")
        print("  1. Initialize database with seed data")
        print("  2. Initialize schema only (no seed data)")
        print("  3. Reset database (delete and recreate)")
        print("  4. Verify database")
        print("  5. Exit")
        
        choice = input("\nSelect option (1-5): ").strip()
        
        if choice == "1":
            init_database(seed_data=True)
        elif choice == "2":
            init_database(seed_data=False)
        elif choice == "3":
            reset_database()
        elif choice == "4":
            verify_database()
        elif choice == "5":
            print("👋 Goodbye!")
        else:
            print("❌ Invalid option")