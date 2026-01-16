-- FamilyBudget+ Seed Data
-- Sample data for testing and demonstration

-- Insert demo user
INSERT OR IGNORE INTO users (id, email, full_name, role) VALUES 
('demo-user-001', 'demo@familybudget.com', 'Famille Demo', 'user'),
('admin-user-001', 'admin@familybudget.com', 'Admin FamilyBudget', 'admin');

-- Insert sample incomes
INSERT OR IGNORE INTO incomes (id, title, amount, date, is_recurring, notes, created_by) VALUES
('income-001', 'Salaire mensuel', 12000.00, '2025-01-01', 1, 'Salaire principal', 'demo@familybudget.com'),
('income-002', 'Freelance web', 2500.00, '2025-01-15', 0, 'Projet site e-commerce', 'demo@familybudget.com'),
('income-003', 'Salaire mensuel', 12000.00, '2024-12-01', 1, 'Salaire principal', 'demo@familybudget.com'),
('income-004', 'Prime de fin d''année', 5000.00, '2024-12-20', 0, 'Bonus annuel', 'demo@familybudget.com');

-- Insert sample expenses
INSERT OR IGNORE INTO expenses (id, title, amount, category, date, is_recurring, notes, created_by) VALUES
-- January 2025
('expense-001', 'Loyer appartement', 4000.00, 'rent', '2025-01-01', 1, 'Loyer mensuel', 'demo@familybudget.com'),
('expense-002', 'Courses supermarché', 850.00, 'food', '2025-01-05', 0, 'Courses hebdomadaires', 'demo@familybudget.com'),
('expense-003', 'Facture électricité', 320.00, 'utilities', '2025-01-10', 1, 'LYDEC', 'demo@familybudget.com'),
('expense-004', 'Transport Uber', 180.00, 'transport', '2025-01-12', 0, 'Déplacements ville', 'demo@familybudget.com'),
('expense-005', 'Médicaments pharmacie', 150.00, 'health', '2025-01-14', 0, 'Pharmacie centrale', 'demo@familybudget.com'),
('expense-006', 'Cours de soutien enfants', 600.00, 'education', '2025-01-08', 1, 'Cours particuliers', 'demo@familybudget.com'),
('expense-007', 'Sortie cinéma famille', 200.00, 'leisure', '2025-01-18', 0, 'Megarama', 'demo@familybudget.com'),
('expense-008', 'Vêtements enfants', 450.00, 'clothing', '2025-01-20', 0, 'Rentrée scolaire', 'demo@familybudget.com'),
('expense-009', 'Internet et téléphone', 250.00, 'utilities', '2025-01-05', 1, 'Maroc Telecom', 'demo@familybudget.com'),
('expense-010', 'Courses alimentaires', 920.00, 'food', '2025-01-12', 0, 'Marjane', 'demo@familybudget.com'),
('expense-011', 'Essence voiture', 400.00, 'transport', '2025-01-15', 0, 'Station Total', 'demo@familybudget.com'),
('expense-012', 'Restaurant famille', 350.00, 'leisure', '2025-01-22', 0, 'Sortie weekend', 'demo@familybudget.com'),

-- December 2024
('expense-013', 'Loyer appartement', 4000.00, 'rent', '2024-12-01', 1, 'Loyer mensuel', 'demo@familybudget.com'),
('expense-014', 'Courses supermarché', 780.00, 'food', '2024-12-05', 0, 'Courses hebdomadaires', 'demo@familybudget.com'),
('expense-015', 'Facture électricité', 380.00, 'utilities', '2024-12-10', 1, 'LYDEC', 'demo@familybudget.com'),
('expense-016', 'Cadeaux Noël', 1200.00, 'other', '2024-12-20', 0, 'Cadeaux famille', 'demo@familybudget.com'),
('expense-017', 'Cours de soutien enfants', 600.00, 'education', '2024-12-08', 1, 'Cours particuliers', 'demo@familybudget.com'),
('expense-018', 'Essence voiture', 450.00, 'transport', '2024-12-12', 0, 'Station Afriquia', 'demo@familybudget.com'),
('expense-019', 'Internet et téléphone', 250.00, 'utilities', '2024-12-05', 1, 'Maroc Telecom', 'demo@familybudget.com'),
('expense-020', 'Repas de fête', 800.00, 'food', '2024-12-25', 0, 'Réveillon', 'demo@familybudget.com'),

-- November 2024
('expense-021', 'Loyer appartement', 4000.00, 'rent', '2024-11-01', 1, 'Loyer mensuel', 'demo@familybudget.com'),
('expense-022', 'Courses supermarché', 850.00, 'food', '2024-11-05', 0, 'Courses hebdomadaires', 'demo@familybudget.com'),
('expense-023', 'Facture électricité', 290.00, 'utilities', '2024-11-10', 1, 'LYDEC', 'demo@familybudget.com'),
('expense-024', 'Consultation médecin', 300.00, 'health', '2024-11-15', 0, 'Visite pédiatre', 'demo@familybudget.com'),
('expense-025', 'Cours de soutien enfants', 600.00, 'education', '2024-11-08', 1, 'Cours particuliers', 'demo@familybudget.com'),
('expense-026', 'Transport taxi', 220.00, 'transport', '2024-11-18', 0, 'Déplacements', 'demo@familybudget.com');

-- Insert budget goals for January 2025
INSERT OR IGNORE INTO budget_goals (id, category, monthly_limit, alert_threshold, month, created_by) VALUES
('goal-001', 'food', 2000.00, 80, '2025-01', 'demo@familybudget.com'),
('goal-002', 'transport', 500.00, 75, '2025-01', 'demo@familybudget.com'),
('goal-003', 'leisure', 800.00, 80, '2025-01', 'demo@familybudget.com'),
('goal-004', 'health', 500.00, 85, '2025-01', 'demo@familybudget.com'),
('goal-005', 'utilities', 600.00, 80, '2025-01', 'demo@familybudget.com');