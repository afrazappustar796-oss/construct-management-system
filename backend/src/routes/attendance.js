const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, workerId, siteId } = req.query;
    const where = {};
    
    if (date) where.date = { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86400000) };
    if (workerId) where.workerId = parseInt(workerId);
    if (siteId) where.siteId = parseInt(siteId);

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        worker: { select: { id: true, name: true, role: true } },
        site: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/worker/:workerId', authMiddleware, async (req, res) => {
  try {
    const attendance = await prisma.attendance.findMany({
      where: { workerId: parseInt(req.params.workerId) },
      orderBy: { date: 'desc' },
      take: 30,
      include: {
        site: { select: { id: true, name: true } }
      }
    });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const { workerId, siteId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: {
        workerId: parseInt(workerId),
        date: { gte: today }
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        workerId: parseInt(workerId),
        siteId: siteId ? parseInt(siteId) : null,
        checkIn: new Date(),
        status: 'PRESENT'
      },
      include: {
        worker: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { workerId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        workerId: parseInt(workerId),
        date: { gte: today }
      }
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No check-in found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out' });
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: new Date() },
      include: {
        worker: { select: { id: true, name: true } }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { workerId, date, checkIn, checkOut, status, siteId } = req.body;

    const attendance = await prisma.attendance.create({
      data: {
        workerId: parseInt(workerId),
        siteId: siteId ? parseInt(siteId) : null,
        date: date ? new Date(date) : new Date(),
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status: status || 'PRESENT'
      },
      include: {
        worker: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;