const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');
const authenticateToken = require('./middlewares/authMiddleware');
const authRoutes = require('./routes/auth');
const llmRoutes = require('./routes/llmRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/llm', authenticateToken, llmRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
