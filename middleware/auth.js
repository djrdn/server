const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Отримати токен за назви Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // перевірка на те, що токен існує
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Перевірка токену
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;

    next();
  });
};

module.exports = { authenticateToken };