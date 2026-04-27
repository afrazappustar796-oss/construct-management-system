const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/low-stock', authMiddleware, async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      where: {
        minStock: { gt: 0 }
      }
    });

    const lowStockAlerts = [];
    for (const material of materials) {
      const totalIn = await prisma.inventoryLog.aggregate({
        where: { materialId: material.id, type: 'IN' },
        _sum: { quantity: true }
      });
      const totalOut = await prisma.inventoryLog.aggregate({
        where: { materialId: material.id, type: { in: ['OUT', 'TRANSFER'] } },
        _sum: { quantity: true }
      });

      const currentStock = (totalIn._sum.quantity || 0) - (totalOut._sum.quantity || 0);
      if (currentStock <= material.minStock) {
        lowStockAlerts.push({
          ...material,
          currentStock,
          minStock: material.minStock
        });
      }
    }

    res.json({ success: true, data: lowStockAlerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const material = await prisma.material.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const totalIn = await prisma.inventoryLog.aggregate({
      where: { materialId: material.id, type: 'IN' },
      _sum: { quantity: true }
    });
    const totalOut = await prisma.inventoryLog.aggregate({
      where: { materialId: material.id, type: { in: ['OUT', 'TRANSFER'] } },
      _sum: { quantity: true }
    });

    res.json({
      success: true,
      data: {
        ...material,
        currentStock: (totalIn._sum.quantity || 0) - (totalOut._sum.quantity || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { name, unit, costPerUnit, minStock } = req.body;

    const material = await prisma.material.create({
      data: {
        name,
        unit,
        costPerUnit: parseFloat(costPerUnit),
        minStock: minStock ? parseFloat(minStock) : 0
      }
    });

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { name, unit, costPerUnit, minStock } = req.body;

    const material = await prisma.material.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(unit && { unit }),
        ...(costPerUnit && { costPerUnit: parseFloat(costPerUnit) }),
        ...(minStock !== undefined && { minStock: parseFloat(minStock) })
      }
    });

    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.material.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;