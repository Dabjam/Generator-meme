const API_URL = '/api/memes';
let selectedImageId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadImages();
    loadMemes();

    document.getElementById('createMemeForm').addEventListener('submit', createMeme);
});

async function loadImages() {
    try {
        const response = await fetch(`${API_URL}/images`);
        const data = await response.json();

        if (data.success) {
            const imagesContainer = document.getElementById('imagesContainer');
            imagesContainer.innerHTML = '';

            data.images.forEach((image, index) => {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item';
                imageItem.dataset.id = image.id;
                imageItem.innerHTML = `
                        <div class="image-number">${index + 1}</div>
                        <img src="${image.url}" 
                             alt="Изображение ${index + 1}" 
                             title="Нажмите для выбора"
                             onerror="this.src='${image.fallback || 'https://via.placeholder.com/300x300/667eea/ffffff?text=Мем+' + (index + 1)}'">
                    `;

                imageItem.addEventListener('click', () => {

                    document.querySelectorAll('.image-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    imageItem.classList.add('selected');
                    selectedImageId = image.id;

                    showNotification(`Выбрано изображение: ${image.name}`, 'success');
                });

                imagesContainer.appendChild(imageItem);
            });
        } else {
            showNotification(data.error || 'Ошибка при загрузке изображений', 'error');
        }
    } catch (error) {
        console.error('Ошибка при загрузке изображений:', error);
        showNotification('Ошибка при загрузке изображений', 'error');
    }
}

async function loadMemes() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const memesContainer = document.getElementById('memesContainer');
        const emptyState = document.getElementById('emptyState');

        if (data.success) {
            if (data.memes && data.memes.length > 0) {
                emptyState.style.display = 'none';
                memesContainer.innerHTML = '';

                const sortedMemes = data.memes.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                sortedMemes.forEach(meme => {
                    const memeItem = document.createElement('div');
                    memeItem.className = 'meme-item';
                    memeItem.innerHTML = `
                            <div class="meme-preview">
                                <img src="${meme.imageUrl || 'https://via.placeholder.com/400x300/667eea/ffffff?text=Мем'}" 
                                     alt="Мем ${meme.id}"
                                     onerror="this.src='https://via.placeholder.com/400x300/667eea/ffffff?text=Мем+' + ${meme.id}">
                                ${meme.topText ? `<div class="meme-text-overlay top-text">${meme.topText}</div>` : ''}
                                ${meme.bottomText ? `<div class="meme-text-overlay bottom-text">${meme.bottomText}</div>` : ''}
                            </div>
                            <div class="meme-info">
                                <div class="meme-info-text">
                                    <p><strong>Автор:</strong> ${meme.author || 'Аноним'}</p>
                                    <p><strong>Создан:</strong> ${formatDate(meme.createdAt)}</p>
                                    ${meme.updatedAt ? `<p><strong>Обновлен:</strong> ${formatDate(meme.updatedAt)}</p>` : ''}
                                </div>
                                <button class="btn btn-delete" onclick="deleteMeme(${meme.id})">
                                    <i class="fas fa-trash"></i> Удалить
                                </button>
                            </div>
                        `;
                    memesContainer.appendChild(memeItem);
                });
            } else {
                emptyState.style.display = 'block';
                memesContainer.innerHTML = '';
            }
        } else {
            showNotification(data.error || 'Ошибка при загрузке мемов', 'error');
        }
    } catch (error) {
        console.error('Ошибка при загрузке мемов:', error);
        showNotification('Ошибка при загрузке мемов', 'error');
    }
}

async function createMeme(e) {
    e.preventDefault();

    if (!selectedImageId) {
        showNotification('Пожалуйста, выберите изображение!', 'error');
        return;
    }

    const memeData = {
        imageId: selectedImageId,
        topText: document.getElementById('topText').value,
        bottomText: document.getElementById('bottomText').value,
        author: document.getElementById('author').value || 'Аноним'
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memeData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('🎉 Мем успешно создан!', 'success');
            document.getElementById('createMemeForm').reset();

            document.querySelectorAll('.image-item').forEach(item => {
                item.classList.remove('selected');
            });
            selectedImageId = null;

            await loadMemes(); 
        } else {
            showNotification(data.error || 'Ошибка при создании мема', 'error');
        }
    } catch (error) {
        console.error('Ошибка при создании мема:', error);
        showNotification('Ошибка при создании мема', 'error');
    }
}

async function deleteMeme(id) {
    if (confirm('Вы уверены, что хотите удалить этот мем?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                showNotification('Мем успешно удален', 'success');
                await loadMemes(); 
            } else {
                showNotification(data.error || 'Ошибка при удалении мема', 'error');
            }
        } catch (error) {
            console.error('Ошибка при удалении мема:', error);
            showNotification('Ошибка при удалении мема', 'error');
        }
    }
}

function showNotification(message, type = 'success') {

    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;

    document.body.appendChild(notification);


    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function formatDate(dateString) {
    if (!dateString) return 'неизвестно';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
