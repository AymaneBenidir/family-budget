import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { month } = await req.json();
        const targetMonth = month || new Date().toISOString().slice(0, 7);
        const [year, monthNum] = targetMonth.split('-');

        // Fetch data
        const allExpenses = await base44.entities.Expense.list('-date');
        const allIncomes = await base44.entities.Income.list('-date');
        const allGoals = await base44.entities.BudgetGoal.list();

        // Filter for target month
        const expenses = allExpenses.filter(e => e.date.startsWith(targetMonth));
        const incomes = allIncomes.filter(i => i.date.startsWith(targetMonth));
        const goals = allGoals.filter(g => g.month === targetMonth);

        // Calculate totals
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
        const balance = totalIncomes - totalExpenses;

        // Category breakdown
        const categoryTotals = expenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {});

        // Category with counts
        const categoryDetails = Object.entries(categoryTotals).map(([category, total]) => ({
            category,
            total,
            count: expenses.filter(e => e.category === category).length,
            percentage: ((total / totalExpenses) * 100).toFixed(1)
        })).sort((a, b) => b.total - a.total);

        // Top expenses
        const topExpenses = expenses
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map(e => ({
                title: e.title,
                amount: e.amount,
                category: e.category,
                date: e.date
            }));

        // Goal status
        const goalStatus = goals.map(g => {
            const spent = categoryTotals[g.category] || 0;
            const percentage = Math.min((spent / g.monthly_limit) * 100, 100);
            const remaining = g.monthly_limit - spent;
            
            return {
                category: g.category,
                limit: g.monthly_limit,
                spent,
                remaining,
                percentage: percentage.toFixed(1),
                status: percentage >= 100 ? 'exceeded' : 
                       percentage >= g.alert_threshold ? 'warning' : 'ok',
                alertThreshold: g.alert_threshold
            };
        });

        // Compare with previous month
        const prevMonth = new Date(year, monthNum - 2, 1).toISOString().slice(0, 7);
        const prevExpenses = allExpenses.filter(e => e.date.startsWith(prevMonth));
        const prevIncomes = allIncomes.filter(i => i.date.startsWith(prevMonth));
        
        const prevTotalExpenses = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
        const prevTotalIncomes = prevIncomes.reduce((sum, i) => sum + i.amount, 0);
        
        const expenseChange = prevTotalExpenses > 0 
            ? (((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100).toFixed(1)
            : 0;
        const incomeChange = prevTotalIncomes > 0
            ? (((totalIncomes - prevTotalIncomes) / prevTotalIncomes) * 100).toFixed(1)
            : 0;

        // Insights
        const insights = [];
        
        if (balance < 0) {
            insights.push({
                type: 'warning',
                message: `Vos dépenses dépassent vos revenus de ${Math.abs(balance).toFixed(2)} MAD ce mois-ci.`
            });
        } else if (balance > 0) {
            const savingsRate = ((balance / totalIncomes) * 100).toFixed(1);
            insights.push({
                type: 'success',
                message: `Bravo ! Vous avez épargné ${savingsRate}% de vos revenus ce mois-ci.`
            });
        }

        const exceededGoals = goalStatus.filter(g => g.status === 'exceeded');
        if (exceededGoals.length > 0) {
            insights.push({
                type: 'alert',
                message: `${exceededGoals.length} objectif(s) budgétaire(s) dépassé(s) ce mois-ci.`
            });
        }

        if (parseFloat(expenseChange) > 20) {
            insights.push({
                type: 'info',
                message: `Vos dépenses ont augmenté de ${expenseChange}% par rapport au mois dernier.`
            });
        }

        const topCategory = categoryDetails[0];
        if (topCategory) {
            insights.push({
                type: 'info',
                message: `Votre catégorie de dépense principale est ${topCategory.category} (${topCategory.percentage}% du total).`
            });
        }

        // Recommendations
        const recommendations = [];
        
        if (balance < 0) {
            recommendations.push('Identifiez les dépenses non essentielles à réduire le mois prochain.');
        }
        
        const warningGoals = goalStatus.filter(g => g.status === 'warning' || g.status === 'exceeded');
        if (warningGoals.length > 0) {
            recommendations.push(`Réévaluez vos limites budgétaires pour ${warningGoals.length} catégorie(s).`);
        }

        const savingsRate = totalIncomes > 0 ? ((balance / totalIncomes) * 100) : 0;
        if (savingsRate < 10 && balance >= 0) {
            recommendations.push('Essayez d\'épargner au moins 20% de vos revenus chaque mois.');
        }

        if (categoryDetails.length > 0 && categoryDetails[0].percentage > 40) {
            recommendations.push(`Diversifiez vos dépenses - ${categoryDetails[0].category} représente plus de 40% du total.`);
        }

        return Response.json({
            month: targetMonth,
            summary: {
                totalIncomes,
                totalExpenses,
                balance,
                savingsRate: totalIncomes > 0 ? ((balance / totalIncomes) * 100).toFixed(1) : '0',
                transactionCount: expenses.length + incomes.length,
                expenseCount: expenses.length,
                incomeCount: incomes.length
            },
            comparison: {
                previousMonth: prevMonth,
                expenseChange: parseFloat(expenseChange),
                incomeChange: parseFloat(incomeChange)
            },
            categories: categoryDetails,
            topExpenses,
            goals: goalStatus,
            insights,
            recommendations
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});