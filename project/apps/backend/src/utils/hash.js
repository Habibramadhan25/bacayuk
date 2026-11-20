const crypto = require('crypto');

const SALT = '_bacayuk_salt_2026';

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password) + SALT).digest('hex');
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;
  return hashPassword(password) === passwordHash;
}

module.exports = { hashPassword, verifyPassword };
