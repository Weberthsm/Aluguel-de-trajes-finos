const app = require('./app');

const PORT = process.env.PORT || 3000;

// Seed default admin user at startup
const { ensureDefaultAdmin } = require('./services/userService');
ensureDefaultAdmin();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
