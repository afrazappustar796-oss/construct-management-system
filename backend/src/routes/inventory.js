const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      include: {
        site: { select: { id: true, name: true } },
        material: { select: { id: true, name: true, unit: true } }
      },
      orderBy: { date: 'desc' },
      take: 100
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/site/:siteId', authMiddleware, async (req, res) => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      where: { siteId: parseInt(req.params.siteId) },
      include: {
        material: { select: { id: true, name: true, unit: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/material/:materialId', authMiddleware, async (req, res) => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      where: { materialId: parseInt(req.params.materialId) },
      include: {
        site: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER', 'WORKER'), async (req, res) => {
  try {
    const { siteId, materialId, type, quantity, notes } = req.body;

    const log = await prisma.inventoryLog.create({
      data: {
        siteId: parseInt(siteId),
        materialId: parseInt(materialId),
        type,
        quantity: parseFloat(quantity),
        notes
      },
      include: {
        site: { select: { id: true, name: true } },
        material: { select: { id: true, name: true, unit: true } }
      }
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    await prisma.inventoryLog.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Inventory log deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;