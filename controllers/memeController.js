let memesDB = [];
let nextId = 1;

const availableImages = [
  { 
    id: 1, 
    filename: 'meme1.jpg', 
    name: 'Шрек', 
    url: '/images/meme1.jpg',
    fallback: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Смеющийся+кот'
  },
  { 
    id: 2, 
    filename: 'meme2.jpg', 
    name: 'Шрек', 
    url: '/images/meme2.jpg',
    fallback: 'https://via.placeholder.com/400x300/764ba2/ffffff?text=Удивленная+панда'
  },
  { 
    id: 3, 
    filename: 'meme3.jpg', 
    name: 'Шрек', 
    url: '/images/meme3.jpg',
    fallback: 'https://via.placeholder.com/400x300/ed64a6/ffffff?text=Серьезный+хаски'
  },
  { 
    id: 4, 
    filename: 'meme4.jpg', 
    name: 'Шрек', 
    url: '/images/meme4.jpg',
    fallback: 'https://via.placeholder.com/400x300/38a169/ffffff?text=Довольная+лягушка'
  },
  { 
    id: 5, 
    filename: 'meme5.jpg', 
    name: 'Шрек', 
    url: '/images/meme5.jpg',
    fallback: 'https://via.placeholder.com/400x300/e53e3e/ffffff?text=Задумчивая+сова'
  }
];

const memeController = {
  getAllImages: (req, res) => {
    try {
      res.json({
        success: true,
        count: availableImages.length,
        images: availableImages
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка при получении изображений'
      });
    }
  },

  getImageById: (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const image = availableImages.find(img => img.id === imageId);
      
      if (!image) {
        return res.status(404).json({ 
          success: false, 
          error: `Изображение с ID ${imageId} не найдено` 
        });
      }
      
      res.json({ success: true, image });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка при получении изображения'
      });
    }
  },

  createMeme: (req, res) => {
    try {
      const { imageId, topText, bottomText, author = 'Аноним' } = req.body;
      
      if (!imageId || !topText) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID изображения и верхний текст обязательны' 
        });
      }
      
      const image = availableImages.find(img => img.id === parseInt(imageId));
      if (!image) {
        return res.status(404).json({ 
          success: false, 
          error: `Изображение с ID ${imageId} не найдено` 
        });
      }
      
      const newMeme = {
        id: nextId++,
        imageId: parseInt(imageId),
        topText: topText.trim(),
        bottomText: bottomText ? bottomText.trim() : '',
        author: author.trim(),
        createdAt: new Date().toISOString(),
        imageUrl: image.url,
        imageName: image.name
      };
      
      memesDB.push(newMeme);
      
      res.status(201).json({
        success: true,
        message: 'Мем успешно создан',
        meme: newMeme
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка при создании мема'
      });
    }
  },

  getAllMemes: (req, res) => {
    try {
      const { author, sort = 'newest', limit } = req.query;
      
      let filteredMemes = [...memesDB];
      if (author) {
        filteredMemes = filteredMemes.filter(meme => 
          meme.author.toLowerCase().includes(author.toLowerCase())
        );
      }
      
      if (sort === 'oldest') {
        filteredMemes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        filteredMemes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      if (limit && !isNaN(parseInt(limit))) {
        filteredMemes = filteredMemes.slice(0, parseInt(limit));
      }
      
      res.json({
        success: true,
        count: filteredMemes.length,
        total: memesDB.length,
        memes: filteredMemes.map(meme => ({
          ...meme,
          imageUrl: meme.imageUrl || availableImages.find(img => img.id === meme.imageId)?.url || '/images/default.jpg'
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка при получении мемов'
      });
    }
  },

  getMemeById: (req, res) => {
    try {
      const memeId = parseInt(req.params.id);
      const meme = memesDB.find(m => m.id === memeId);
      
      if (!meme) {
        return res.status(404).json({ 
          success: false, 
          error: `Мем с ID ${memeId} не найден` 
        });
      }
      
      res.json({
        success: true,
        meme
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка при получении мема'
      });
    }
  },

  updateMeme: (req, res) => {
    try {
      const memeId = parseInt(req.params.id);
      const { topText, bottomText, author } = req.body;
      
      const memeIndex = memesDB.findIndex(m => m.id === memeId);
      
      if (memeIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          error: `Мем с ID ${memeId} не найден` 
        });
      }
      
      if (topText !== undefined) memesDB[memeIndex].topText = topText.trim();
      if (bottomText !== undefined) memesDB[memeIndex].bottomText = bottomText.trim();
      if (author !== undefined) memesDB[memeIndex].author = author.trim();
      memesDB[memeIndex].updatedAt = new Date().toISOString();
      
      res.json({
        success: true,
        message: 'Мем успешно обновлен',
        meme: memesDB[memeIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка при обновлении мема'
      });
    }
  },

  deleteMeme: (req, res) => {
    try {
      const memeId = parseInt(req.params.id);
      const initialLength = memesDB.length;
      
      memesDB = memesDB.filter(m => m.id !== memeId);
      
      if (memesDB.length === initialLength) {
        return res.status(404).json({ 
          success: false, 
          error: `Мем с ID ${memeId} не найден` 
        });
      }
      
      res.json({
        success: true,
        message: `Мем с ID ${memeId} успешно удален`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка при удалении мема'
      });
    }
  }
};

module.exports = memeController;