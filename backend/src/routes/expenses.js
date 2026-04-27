const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { projectId, siteId, category, startDate, endDate } = req.query;
    const where = {};
    
    if (projectId) where.projectId = parseInt(projectId);
    if (siteId) where.siteId = parseInt(siteId);
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        site: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { projectId, siteId, category, amount, description, date } = req.body;

    const expense = await prisma.expense.create({
      data: {
        projectId: parseInt(projectId),
        siteId: siteId ? parseInt(siteId) : null,
        category,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date()
      },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { category, amount, description } = req.body;

    const expense = await prisma.expense.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(category && { category }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description })
      },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;