const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalProjects,
      totalSites,
      totalWorkers,
      totalMaterials,
      totalExpenses,
      pendingPayments,
      recentExpenses
    ] = await Promise.all([
      prisma.project.count(),
      prisma.site.count(),
      prisma.worker.count(),
      prisma.material.count(),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
      prisma.expense.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { project: { select: { name: true } } }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        totalSites,
        totalWorkers,
        totalMaterials,
        totalExpenses: totalExpenses._sum.amount || 0,
        pendingPayments: pendingPayments._sum.amount || 0,
        recentExpenses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/budget-overview', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        budget: true
      }
    });

    const budgetData = await Promise.all(
      projects.map(async (project) => {
        const totalSpent = await prisma.expense.aggregate({
          where: { projectId: project.id },
          _sum: { amount: true }
        });
        return {
          name: project.name,
          budget: project.budget,
          spent: totalSpent._sum.amount || 0,
          remaining: project.budget - (totalSpent._sum.amount || 0)
        };
      })
    );

    res.json({ success: true, data: budgetData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/labor-costs', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const payments = await prisma.payment.findMany({
      where: { ...where, status: 'PAID' },
      include: { worker: { select: { name: true } },
      orderBy: { date: 'desc' }
    });

    const totalLaborCost = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ success: true, data: { payments, totalLaborCost } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/expense-trends', authMiddleware, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await prisma.expense.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      select: {
        date: true,
        amount: true,
        category: true
      },
      orderBy: { date: 'asc' }
    });

    const dailyTotals = {};
    expenses.forEach(exp => {
      const dateKey = exp.date.toISOString().split('T')[0];
      if (!dailyTotals[dateKey]) dailyTotals[dateKey] = 0;
      dailyTotals[dateKey] += exp.amount;
    });

    const trendData = Object.entries(dailyTotals).map(([date, amount]) => ({ date, amount }));

    res.json({ success: true, data: trendData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/material-usage', authMiddleware, async (req, res) => {
  try {
    const materials = await prisma.material.findMany();
    
    const materialUsage = await Promise.all(
      materials.map(async (material) => {
        const totalOut = await prisma.inventoryLog.aggregate({
          where: { materialId: material.id, type: { in: ['OUT', 'TRANSFER'] },
          _sum: { quantity: true }
        });
        return {
          name: material.name,
          unit: material.unit,
          quantity: totalOut._sum.quantity || 0,
          cost: (totalOut._sum.quantity || 0) * material.costPerUnit
        };
      })
    );

    res.json({ success: true, data: materialUsage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;