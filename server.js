const express = require('express');
const path = require('path');
const memeRoutes = require('./routes/memeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздача статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Кастомный middleware для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Кастомный middleware для обработки CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Обработка preflight запросов
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.sendStatus(200);
});

// Routes
app.use('/api/memes', memeRoutes);

// Маршрут для главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для изображений (fallback)
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'public', 'images', filename);
  
  // Проверяем существование файла
  const fs = require('fs');
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    // Возвращаем заглушку
    const placeholder = `https://via.placeholder.com/300x200/667eea/ffffff?text=${filename.replace('.jpg', '')}`;
    res.redirect(placeholder);
  }
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  console.log(`📁 Статические файлы доступны в папке public/`);
  console.log(`🖼️  API доступен по адресу http://localhost:${PORT}/api/memes`);
  console.log(`🖼️  Изображения доступны по адресу http://localhost:${PORT}/images/имя-файла.jpg`);
});