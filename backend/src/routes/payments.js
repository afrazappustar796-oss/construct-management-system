const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, workerId } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (workerId) where.workerId = parseInt(workerId);

    const payments = await prisma.payment.findMany({
      where,
      include: {
        worker: { select: { id: true, name: true, role: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { workerId, amount, notes } = req.body;

    const payment = await prisma.payment.create({
      data: {
        workerId: parseInt(workerId),
        amount: parseFloat(amount),
        notes
      },
      include: {
        worker: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { status, amount, notes } = req.body;

    const payment = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(status && { status }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(notes && { notes })
      },
      include: {
        worker: { select: { id: true, name: true } }
      }
    });

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.payment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;