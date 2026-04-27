const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const createAuditLog = async (prisma, action, userId, details) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        details
      }
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
};

module.exports = { generateToken, createAuditLog };