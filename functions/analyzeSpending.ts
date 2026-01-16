import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { period = 6 } = await req.json(); // Default 6 months

        // Fetch all data
        const expenses = await base44.entities.Expense.list('-date');
        const incomes = await base44.entities.Income.list('-date');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - period);

        // Filter data by period
        const periodExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });

        const periodIncomes = incomes.filter(i => {
            const incomeDate = new Date(i.date);
            return incomeDate >= startDate && incomeDate <= endDate;
        });

        // Total calculations
        const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncomes = periodIncomes.reduce((sum, i) => sum + i.amount, 0);
        const netBalance = totalIncomes - totalExpenses;

        // Monthly breakdown
        const monthlyData = {};
        
        periodExpenses.forEach(e => {
            const monthKey = e.date.slice(0, 7);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { expenses: 0, incomes: 0, transactions: 0 };
            }
            monthlyData[monthKey].expenses += e.amount;
            monthlyData[monthKey].transactions += 1;
        });

        periodIncomes.forEach(i => {
            const monthKey = i.date.slice(0, 7);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { expenses: 0, incomes: 0, transactions: 0 };
            }
            monthlyData[monthKey].incomes += i.amount;
            monthlyData[monthKey].transactions += 1;
        });

        // Calculate averages
        const monthCount = Object.keys(monthlyData).length || 1;
        const avgMonthlyExpense = totalExpenses / monthCount;
        const avgMonthlyIncome = totalIncomes / monthCount;

        // Category analysis
        const categoryStats = periodExpenses.reduce((acc, e) => {
            if (!acc[e.category]) {
                acc[e.category] = {
                    total: 0,
                    count: 0,
                    transactions: []
                };
            }
            acc[e.category].total += e.amount;
            acc[e.category].count += 1;
            acc[e.category].transactions.push(e.amount);
            return acc;
        }, {});

        // Calculate category insights
        const categoryInsights = Object.entries(categoryStats).map(([category, stats]) => {
            const avg = stats.total / stats.count;
            const max = Math.max(...stats.transactions);
            const min = Math.min(...stats.transactions);
            const percentage = ((stats.total / totalExpenses) * 100).toFixed(1);

            return {
                category,
                total: stats.total,
                count: stats.count,
                average: avg,
                max,
                min,
                percentage,
                trend: calculateTrend(periodExpenses, category)
            };
        }).sort((a, b) => b.total - a.total);

        // Spending patterns
        const patterns = {
            recurringExpenses: periodExpenses.filter(e => e.is_recurring).length,
            largeExpenses: periodExpenses.filter(e => e.amount > avgMonthlyExpense * 0.1).length,
            smallFrequent: periodExpenses.filter(e => e.amount < avgMonthlyExpense * 0.05).length
        };

        // Day of week analysis
        const dayOfWeekSpending = [0, 0, 0, 0, 0, 0, 0];
        periodExpenses.forEach(e => {
            const day = new Date(e.date).getDay();
            dayOfWeekSpending[day] += e.amount;
        });

        const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const dayAnalysis = dayOfWeekSpending.map((amount, index) => ({
            day: daysOfWeek[index],
            amount,
            percentage: ((amount / totalExpenses) * 100).toFixed(1)
        })).sort((a, b) => b.amount - a.amount);

        // Financial health score (0-100)
        let healthScore = 100;
        
        // Deduct for negative balance
        if (netBalance < 0) {
            healthScore -= 30;
        }
        
        // Deduct for low savings rate
        const savingsRate = totalIncomes > 0 ? ((netBalance / totalIncomes) * 100) : 0;
        if (savingsRate < 10) {
            healthScore -= 20;
        } else if (savingsRate < 20) {
            healthScore -= 10;
        }

        // Deduct for high expense concentration
        if (categoryInsights[0] && parseFloat(categoryInsights[0].percentage) > 50) {
            healthScore -= 15;
        }

        // Bonus for consistent income
        const incomeVariation = calculateVariation(periodIncomes.map(i => i.amount));
        if (incomeVariation < 0.2) {
            healthScore += 10;
        }

        healthScore = Math.max(0, Math.min(100, healthScore));

        // Predictions (simple linear trend)
        const nextMonthPrediction = predictNextMonth(monthlyData);

        // Advanced insights
        const advancedInsights = [];

        if (savingsRate < 10 && netBalance >= 0) {
            advancedInsights.push({
                type: 'warning',
                category: 'Épargne',
                message: 'Votre taux d\'épargne est faible. Visez 20% minimum.'
            });
        }

        if (patterns.largeExpenses > monthCount * 2) {
            advancedInsights.push({
                type: 'info',
                category: 'Dépenses importantes',
                message: `Vous avez ${patterns.largeExpenses} dépenses importantes. Planifiez-les mieux.`
            });
        }

        const topSpendingDay = dayAnalysis[0];
        if (topSpendingDay && parseFloat(topSpendingDay.percentage) > 25) {
            advancedInsights.push({
                type: 'info',
                category: 'Habitudes',
                message: `Vous dépensez le plus le ${topSpendingDay.day} (${topSpendingDay.percentage}% du total).`
            });
        }

        const volatileCategories = categoryInsights.filter(c => c.trend && Math.abs(c.trend) > 30);
        if (volatileCategories.length > 0) {
            advancedInsights.push({
                type: 'alert',
                category: 'Volatilité',
                message: `${volatileCategories.length} catégorie(s) montrent une forte variation.`
            });
        }

        return Response.json({
            period: {
                months: period,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            },
            summary: {
                totalExpenses,
                totalIncomes,
                netBalance,
                avgMonthlyExpense: avgMonthlyExpense.toFixed(2),
                avgMonthlyIncome: avgMonthlyIncome.toFixed(2),
                savingsRate: savingsRate.toFixed(1),
                transactionCount: periodExpenses.length + periodIncomes.length
            },
            healthScore: {
                score: Math.round(healthScore),
                rating: healthScore >= 80 ? 'Excellent' : 
                       healthScore >= 60 ? 'Bon' : 
                       healthScore >= 40 ? 'Moyen' : 'À améliorer'
            },
            categoryInsights,
            patterns,
            dayAnalysis,
            monthlyBreakdown: Object.entries(monthlyData).map(([month, data]) => ({
                month,
                ...data,
                balance: data.incomes - data.expenses
            })).sort((a, b) => a.month.localeCompare(b.month)),
            predictions: {
                nextMonthExpenses: nextMonthPrediction.expenses,
                nextMonthIncomes: nextMonthPrediction.incomes,
                projectedBalance: nextMonthPrediction.balance
            },
            insights: advancedInsights
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

// Helper functions
function calculateTrend(expenses, category) {
    const categoryExpenses = expenses
        .filter(e => e.category === category)
        .sort((a, b) => a.date.localeCompare(b.date));
    
    if (categoryExpenses.length < 2) return 0;
    
    const firstHalf = categoryExpenses.slice(0, Math.floor(categoryExpenses.length / 2));
    const secondHalf = categoryExpenses.slice(Math.floor(categoryExpenses.length / 2));
    
    const firstTotal = firstHalf.reduce((sum, e) => sum + e.amount, 0);
    const secondTotal = secondHalf.reduce((sum, e) => sum + e.amount, 0);
    
    if (firstTotal === 0) return 0;
    return (((secondTotal - firstTotal) / firstTotal) * 100).toFixed(1);
}

function calculateVariation(values) {
    if (values.length < 2) return 0;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    return Math.sqrt(variance) / avg;
}

function predictNextMonth(monthlyData) {
    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) {
        const lastMonth = monthlyData[months[0]] || { expenses: 0, incomes: 0 };
        return {
            expenses: lastMonth.expenses,
            incomes: lastMonth.incomes,
            balance: lastMonth.incomes - lastMonth.expenses
        };
    }
    
    const recentMonths = months.slice(-3);
    const avgExpenses = recentMonths.reduce((sum, m) => sum + monthlyData[m].expenses, 0) / recentMonths.length;
    const avgIncomes = recentMonths.reduce((sum, m) => sum + monthlyData[m].incomes, 0) / recentMonths.length;
    
    return {
        expenses: avgExpenses.toFixed(2),
        incomes: avgIncomes.toFixed(2),
        balance: (avgIncomes - avgExpenses).toFixed(2)
    };
}