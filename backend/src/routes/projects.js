const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, name: true } },
        sites: true,
        _count: { select: { sites: true, expenses: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        sites: {
          include: {
            _count: { select: { inventoryLogs: true, expenses: true } }
          }
        },
        expenses: { orderBy: { date: 'desc' }, take: 10 },
        _count: { select: { sites: true, expenses: true } }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const totalExpenses = await prisma.expense.aggregate({
      where: { projectId: project.id },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        ...project,
        totalSpent: totalExpenses._sum.amount || 0,
        remaining: project.budget - (totalExpenses._sum.amount || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        budget: parseFloat(budget),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        ownerId: req.user.id
      },
      include: {
        owner: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate, status } = req.body;

    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(budget && { budget: parseFloat(budget) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status })
      },
      include: {
        owner: { select: { id: true, name: true } }
      }
    });

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;