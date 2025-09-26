import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Zap, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';
import './index.css';

// Конфигурация
const WEBHOOK_URL = 'https://n8n-p.blc.am/webhook-test/xp-purchase?v=' + Date.now();

// Тестовые данные товаров (в реальном приложении загружаются с сервера)
const PRODUCTS = [
  {
    id: 1,
    name: 'Стартовый пакет',
    xp: 5000,
    price: 100,
    description: 'Идеально для начала игры',
    featured: false
  },
  {
    id: 2,
    name: 'Базовый пакет',
    xp: 10000,
    price: 200,
    description: 'Хороший баланс цены и количества',
    featured: true
  },
  {
    id: 3,
    name: 'Улучшенный пакет',
    xp: 15000,
    price: 300,
    description: 'Для продвинутых игроков',
    featured: false
  },
  {
    id: 4,
    name: 'Премиум пакет',
    xp: 20000,
    price: 400,
    description: 'Максимальная выгода',
    featured: false
  },
  {
    id: 5,
    name: 'Мега пакет',
    xp: 100000,
    price: 860,
    description: 'Для серьезных игроков',
    featured: true
  },
  {
    id: 6,
    name: 'Супер пакет',
    xp: 200000,
    price: 1660,
    description: 'Огромное количество XP',
    featured: false
  },
  {
    id: 7,
    name: 'Элитный пакет',
    xp: 500000,
    price: 4390,
    description: 'Для элитных игроков',
    featured: false
  },
  {
    id: 8,
    name: 'Легендарный пакет',
    xp: 1000000,
    price: 6420,
    description: 'Легендарное количество XP',
    featured: true
  }
];

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [userInfo, setUserInfo] = useState({
    tgid: 123456789, // В реальной системе получается из Telegram
    first_name: 'Пользователь',
    username: 'user',
    current_xp: 0
  });

  // Загрузка данных пользователя (в реальном приложении с сервера)
  useEffect(() => {
    // Здесь можно добавить загрузку данных пользователя
    console.log('Загружаем данные пользователя...');
  }, []);

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
    setMessage(null);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;
    
    if (!userInfo.tgid) {
      setMessage({
        type: 'error',
        text: 'Пожалуйста, введите ваш Telegram ID'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const purchaseData = {
        tgid: userInfo.tgid,
        product_id: selectedProduct.id,
        first_name: userInfo.first_name,
        username: userInfo.username
      };

      // В реальной системе tgid получается из Telegram автоматически

      console.log('=== ОТЛАДКА ПОКУПКИ ===');
      console.log('Данные пользователя из state:', userInfo);
      console.log('Отправляем запрос на покупку:', purchaseData);
      console.log('URL webhook:', WEBHOOK_URL);
      console.log('Тип tgid:', typeof purchaseData.tgid);
      console.log('Значение tgid:', purchaseData.tgid);
      console.log('========================');

      const response = await axios.post(WEBHOOK_URL, purchaseData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 секунд таймаут
      });

      console.log('Ответ от сервера:', response.data);

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Покупка успешно инициирована! Инвойс отправлен в Telegram.`
        });
        
        // Обновляем баланс пользователя (в реальном приложении загружаем с сервера)
        setUserInfo(prev => ({
          ...prev,
          current_xp: prev.current_xp + selectedProduct.xp
        }));
      } else {
        setMessage({
          type: 'error',
          text: response.data.error || 'Произошла ошибка при покупке'
        });
      }
    } catch (error) {
      console.error('Ошибка при покупке:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Ошибка соединения с сервером'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPurchase = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setMessage(null);
  };

  const formatNumber = (num) => {
    return num.toLocaleString('ru-RU');
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🚀 XP Purchase System</h1>
        <p>Покупайте XP за Telegram Stars (XTR)</p>
      </header>

          <div className="user-info">
            <h3>👤 Информация о пользователе</h3>
            <div className="user-balance">
              <span>Текущий баланс XP:</span>
              <span className="balance-amount">{formatNumber(userInfo.current_xp)} XP</span>
            </div>
          </div>

      <div className="products-grid">
        {PRODUCTS.map(product => (
          <div key={product.id} className={`product-card ${product.featured ? 'featured' : ''}`}>
            <div className="product-name">{product.name}</div>
            <div className="product-description">{product.description}</div>
            
            <div className="product-stats">
              <div className="xp-amount">
                <Zap size={20} />
                {formatNumber(product.xp)} XP
              </div>
              <div className="price">
                <Star size={20} />
                {product.price} XTR
              </div>
            </div>

            <button
              className="buy-button"
              onClick={() => handleBuyClick(product)}
              disabled={isLoading}
            >
              <ShoppingCart size={20} />
              Купить за {product.price} XTR
            </button>
          </div>
        ))}
      </div>

      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={handleCancelPurchase}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🛒 Подтверждение покупки</div>
              <div className="modal-subtitle">
                Вы точно хотите купить этот товар?
              </div>
            </div>

            <div className="modal-content">
              <div className="purchase-details">
                <div className="detail-row">
                  <span className="detail-label">Товар:</span>
                  <span className="detail-value">{selectedProduct.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Получите XP:</span>
                  <span className="detail-value">{formatNumber(selectedProduct.xp)} XP</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Стоимость:</span>
                  <span className="detail-value">{selectedProduct.price} XTR</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ваш текущий баланс:</span>
                  <span className="detail-value">{formatNumber(userInfo.current_xp)} XP</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Баланс после покупки:</span>
                  <span className="detail-value">
                    {formatNumber(userInfo.current_xp + selectedProduct.xp)} XP
                  </span>
                </div>
              </div>

              {message && (
                <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                  {message.type === 'success' ? (
                    <CheckCircle size={20} style={{ marginRight: '10px' }} />
                  ) : (
                    <XCircle size={20} style={{ marginRight: '10px' }} />
                  )}
                  {message.text}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={handleCancelPurchase}
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                className="modal-button confirm"
                onClick={handleConfirmPurchase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    Обработка...
                  </div>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Да, купить!
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
