-- FamilyBudget+ Database Schema
-- SQLite compatible schema for traditional Flask deployment
-- Generated from Base44 entities structure

-- Users table (authentication handled separately in Flask)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount REAL NOT NULL CHECK(amount >= 0),
    category TEXT CHECK(category IN (
        'food', 'rent', 'transport', 'education', 
        'health', 'leisure', 'utilities', 'clothing', 
        'savings', 'other'
    )) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    is_recurring INTEGER DEFAULT 0 CHECK(is_recurring IN (0, 1)),
    created_by TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE CASCADE
);

-- Incomes table
CREATE TABLE IF NOT EXISTS incomes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount REAL NOT NULL CHECK(amount >= 0),
    date DATE NOT NULL,
    is_recurring INTEGER DEFAULT 0 CHECK(is_recurring IN (0, 1)),
    notes TEXT,
    created_by TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE CASCADE
);

-- Budget Goals table
CREATE TABLE IF NOT EXISTS budget_goals (
    id TEXT PRIMARY KEY,
    category TEXT CHECK(category IN (
        'food', 'rent', 'transport', 'education', 
        'health', 'leisure', 'utilities', 'clothing', 
        'savings', 'other'
    )) NOT NULL,
    monthly_limit REAL NOT NULL CHECK(monthly_limit >= 0),
    alert_threshold INTEGER DEFAULT 80 CHECK(alert_threshold BETWEEN 0 AND 100),
    month TEXT NOT NULL, -- Format: YYYY-MM
    created_by TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE CASCADE,
    UNIQUE(category, month, created_by)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date DESC);
CREATE INDEX IF NOT EXISTS idx_incomes_created_by ON incomes(created_by);
CREATE INDEX IF NOT EXISTS idx_budget_goals_month ON budget_goals(month);
CREATE INDEX IF NOT EXISTS idx_budget_goals_created_by ON budget_goals(created_by);

-- Triggers for updated_date
CREATE TRIGGER IF NOT EXISTS update_expenses_timestamp 
AFTER UPDATE ON expenses
BEGIN
    UPDATE expenses SET updated_date = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_incomes_timestamp 
AFTER UPDATE ON incomes
BEGIN
    UPDATE incomes SET updated_date = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_budget_goals_timestamp 
AFTER UPDATE ON budget_goals
BEGIN
    UPDATE budget_goals SET updated_date = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;