const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      include: {
        _count: { select: { attendance: true, payments: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        attendance: { orderBy: { date: 'desc' }, take: 30 },
        payments: { orderBy: { date: 'desc' }, take: 10 },
        _count: { select: { attendance: true, payments: true } }
      }
    });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const totalPaid = await prisma.payment.aggregate({
      where: { workerId: worker.id, status: 'PAID' },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        ...worker,
        totalPaid: totalPaid._sum.amount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { name, role, phone, wageType, wageAmount } = req.body;

    const worker = await prisma.worker.create({
      data: {
        name,
        role,
        phone,
        wageType: wageType || 'DAILY',
        wageAmount: parseFloat(wageAmount)
      }
    });

    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { name, role, phone, wageType, wageAmount, status } = req.body;

    const worker = await prisma.worker.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(phone && { phone }),
        ...(wageType && { wageType }),
        ...(wageAmount && { wageAmount: parseFloat(wageAmount) }),
        ...(status && { status })
      }
    });

    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.worker.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;