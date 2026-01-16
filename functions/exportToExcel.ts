import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { month, type = 'all' } = await req.json();
        
        // Fetch all data
        const expenses = await base44.entities.Expense.list('-date');
        const incomes = await base44.entities.Income.list('-date');
        const goals = await base44.entities.BudgetGoal.list();

        // Filter by month if provided
        let filteredExpenses = expenses;
        let filteredIncomes = incomes;
        let filteredGoals = goals;

        if (month) {
            filteredExpenses = expenses.filter(e => e.date.startsWith(month));
            filteredIncomes = incomes.filter(i => i.date.startsWith(month));
            filteredGoals = goals.filter(g => g.month === month);
        }

        const categoryLabels = {
            food: 'Alimentation',
            rent: 'Loyer',
            transport: 'Transport',
            education: 'Éducation',
            health: 'Santé',
            leisure: 'Loisirs',
            utilities: 'Services',
            clothing: 'Vêtements',
            savings: 'Épargne',
            other: 'Autres'
        };

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Expenses sheet
        if (type === 'all' || type === 'expenses') {
            const expenseData = filteredExpenses.map(e => ({
                'Date': e.date,
                'Description': e.title,
                'Catégorie': categoryLabels[e.category] || e.category,
                'Montant (MAD)': e.amount,
                'Récurrent': e.is_recurring ? 'Oui' : 'Non',
                'Notes': e.notes || ''
            }));
            
            const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
            
            // Set column widths
            expenseSheet['!cols'] = [
                { wch: 12 }, // Date
                { wch: 30 }, // Description
                { wch: 15 }, // Catégorie
                { wch: 15 }, // Montant
                { wch: 10 }, // Récurrent
                { wch: 30 }  // Notes
            ];
            
            XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Dépenses');
        }

        // Incomes sheet
        if (type === 'all' || type === 'incomes') {
            const incomeData = filteredIncomes.map(i => ({
                'Date': i.date,
                'Source': i.title,
                'Montant (MAD)': i.amount,
                'Récurrent': i.is_recurring ? 'Oui' : 'Non',
                'Notes': i.notes || ''
            }));
            
            const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
            
            incomeSheet['!cols'] = [
                { wch: 12 },
                { wch: 30 },
                { wch: 15 },
                { wch: 10 },
                { wch: 30 }
            ];
            
            XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Revenus');
        }

        // Summary sheet
        if (type === 'all') {
            const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
            const totalIncomes = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
            const balance = totalIncomes - totalExpenses;

            // Category breakdown
            const categoryTotals = filteredExpenses.reduce((acc, e) => {
                const cat = categoryLabels[e.category] || e.category;
                acc[cat] = (acc[cat] || 0) + e.amount;
                return acc;
            }, {});

            const summaryData = [
                { 'Indicateur': 'Total Revenus', 'Valeur (MAD)': totalIncomes.toFixed(2) },
                { 'Indicateur': 'Total Dépenses', 'Valeur (MAD)': totalExpenses.toFixed(2) },
                { 'Indicateur': 'Solde', 'Valeur (MAD)': balance.toFixed(2) },
                { 'Indicateur': 'Taux d\'épargne', 'Valeur (MAD)': totalIncomes > 0 ? `${((balance / totalIncomes) * 100).toFixed(1)}%` : '0%' },
                { 'Indicateur': '', 'Valeur (MAD)': '' },
                { 'Indicateur': 'Dépenses par catégorie', 'Valeur (MAD)': '' },
                ...Object.entries(categoryTotals).map(([cat, amount]) => ({
                    'Indicateur': `  ${cat}`,
                    'Valeur (MAD)': amount.toFixed(2)
                }))
            ];

            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
            
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');
        }

        // Budget goals sheet
        if ((type === 'all' || type === 'goals') && filteredGoals.length > 0) {
            const categoryTotals = filteredExpenses.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + e.amount;
                return acc;
            }, {});

            const goalsData = filteredGoals.map(g => {
                const spent = categoryTotals[g.category] || 0;
                const percentage = ((spent / g.monthly_limit) * 100).toFixed(1);
                const status = spent > g.monthly_limit ? 'Dépassé' : 
                             percentage >= g.alert_threshold ? 'Attention' : 'OK';

                return {
                    'Catégorie': categoryLabels[g.category],
                    'Limite (MAD)': g.monthly_limit,
                    'Dépensé (MAD)': spent.toFixed(2),
                    'Restant (MAD)': (g.monthly_limit - spent).toFixed(2),
                    'Pourcentage': `${percentage}%`,
                    'Statut': status
                };
            });

            const goalsSheet = XLSX.utils.json_to_sheet(goalsData);
            goalsSheet['!cols'] = [
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 12 },
                { wch: 12 }
            ];

            XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Objectifs');
        }

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        const filename = month 
            ? `budget-${month}.xlsx`
            : `budget-complet-${new Date().toISOString().split('T')[0]}.xlsx`;

        return new Response(excelBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=${filename}`
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});