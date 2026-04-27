const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { limit } = req.query;
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: limit ? parseInt(limit) : 100
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { action, details } = req.body;
    
    const log = await prisma.auditLog.create({
      data: {
        action,
        userId: req.user.id,
        details
      }
    });
    
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;