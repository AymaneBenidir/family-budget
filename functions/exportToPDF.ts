import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { month } = await req.json();
        const [year, monthNum] = month ? month.split('-') : [new Date().getFullYear(), String(new Date().getMonth() + 1).padStart(2, '0')];
        
        // Fetch data for the month
        const expenses = await base44.entities.Expense.list('-date');
        const incomes = await base44.entities.Income.list('-date');
        const goals = await base44.entities.BudgetGoal.list();

        // Filter for current month
        const monthExpenses = expenses.filter(e => e.date.startsWith(`${year}-${monthNum}`));
        const monthIncomes = incomes.filter(i => i.date.startsWith(`${year}-${monthNum}`));
        const monthGoals = goals.filter(g => g.month === `${year}-${monthNum}`);

        // Calculate totals
        const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncomes = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
        const balance = totalIncomes - totalExpenses;

        // Category totals
        const categoryTotals = monthExpenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {});

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

        // Create PDF
        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(13, 148, 136);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('FamilyBudget+', 20, 20);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Rapport mensuel - ${monthNum}/${year}`, 20, 30);

        // Summary boxes
        doc.setTextColor(0, 0, 0);
        let yPos = 55;

        // Income box
        doc.setFillColor(16, 185, 129);
        doc.roundedRect(20, yPos, 50, 25, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('Revenus', 25, yPos + 8);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`${totalIncomes.toFixed(2)} MAD`, 25, yPos + 18);

        // Expense box
        doc.setFillColor(244, 63, 94);
        doc.roundedRect(75, yPos, 50, 25, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Dépenses', 80, yPos + 8);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`${totalExpenses.toFixed(2)} MAD`, 80, yPos + 18);

        // Balance box
        doc.setFillColor(balance >= 0 ? 13 : 245, balance >= 0 ? 148 : 158, balance >= 0 ? 136 : 66);
        doc.roundedRect(130, yPos, 50, 25, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Solde', 135, yPos + 8);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`${balance.toFixed(2)} MAD`, 135, yPos + 18);

        yPos += 40;

        // Category breakdown
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Dépenses par catégorie', 20, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setDrawColor(226, 232, 240);
        doc.line(20, yPos, 190, yPos);
        yPos += 5;

        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            doc.setFont(undefined, 'bold');
            doc.text(categoryLabels[category] || category, 25, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(`${amount.toFixed(2)} MAD (${percentage}%)`, 100, yPos);
            yPos += 8;
            
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        });

        // Budget goals section
        if (monthGoals.length > 0) {
            yPos += 10;
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Objectifs budgétaires', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.line(20, yPos, 190, yPos);
            yPos += 5;

            monthGoals.forEach(goal => {
                const spent = categoryTotals[goal.category] || 0;
                const percentage = Math.min((spent / goal.monthly_limit) * 100, 100);
                const status = percentage >= 100 ? '❌ Dépassé' : percentage >= goal.alert_threshold ? '⚠️ Attention' : '✅ OK';
                
                doc.setFont(undefined, 'bold');
                doc.text(categoryLabels[goal.category], 25, yPos);
                doc.setFont(undefined, 'normal');
                doc.text(`${spent.toFixed(2)} / ${goal.monthly_limit.toFixed(2)} MAD`, 100, yPos);
                doc.text(status, 160, yPos);
                yPos += 8;

                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
            });
        }

        // Recent transactions
        yPos += 10;
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Dernières transactions', 20, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.line(20, yPos, 190, yPos);
        yPos += 5;

        const recentTransactions = [
            ...monthExpenses.map(e => ({ ...e, type: 'expense' })),
            ...monthIncomes.map(i => ({ ...i, type: 'income' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        recentTransactions.forEach(tx => {
            const label = tx.type === 'expense' ? '🔴' : '🟢';
            const cat = tx.type === 'expense' ? categoryLabels[tx.category] : 'Revenu';
            
            doc.text(`${label} ${tx.title}`, 25, yPos);
            doc.text(cat, 100, yPos);
            doc.text(`${tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)} MAD`, 150, yPos);
            yPos += 7;

            if (yPos > 275) {
                doc.addPage();
                yPos = 20;
            }
        });

        // Footer
        const pageCount = doc.internal.pages.length - 1;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} | FamilyBudget+ | Page ${i}/${pageCount}`, 20, 290);
        }

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=budget-${year}-${monthNum}.pdf`
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});