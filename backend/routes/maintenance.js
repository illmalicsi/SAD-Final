const express = require('express');
const router = express.Router();

// Maintenance endpoints have been removed. Return 404 for any maintenance route.
router.use((req, res) => {
  res.status(404).json({ success: false, message: 'Maintenance endpoints removed' });
});

module.exports = router;
