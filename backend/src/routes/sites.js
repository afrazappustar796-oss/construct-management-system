const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        project: { select: { id: true, name: true, budget: true } },
        manager: { select: { id: true, name: true } },
        _count: { select: { inventoryLogs: true, expenses: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: sites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      where: { projectId: parseInt(req.params.projectId) },
      include: {
        manager: { select: { id: true, name: true } },
        _count: { select: { inventoryLogs: true, expenses: true, attendance: true } }
      }
    });
    res.json({ success: true, data: sites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const site = await prisma.site.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        project: true,
        manager: { select: { id: true, name: true, email: true } },
        inventoryLogs: {
          orderBy: { date: 'desc' },
          take: 20,
          include: { material: true }
        },
        expenses: { orderBy: { date: 'desc' }, take: 10 },
        attendance: { orderBy: { date: 'desc' }, take: 10, include: { worker: true } },
        _count: { select: { inventoryLogs: true, expenses: true, attendance: true } }
      }
    });

    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }

    res.json({ success: true, data: site });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { name, location, projectId, managerId } = req.body;

    const site = await prisma.site.create({
      data: {
        name,
        location,
        projectId: parseInt(projectId),
        managerId: managerId ? parseInt(managerId) : null
      },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ success: true, data: site });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { name, location, status, managerId } = req.body;

    const site = await prisma.site.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(location && { location }),
        ...(status && { status }),
        ...(managerId && { managerId: parseInt(managerId) })
      },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    res.json({ success: true, data: site });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.site.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Site deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;