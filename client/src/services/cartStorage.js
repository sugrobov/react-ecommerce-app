import localForage from 'localforage';

const cartStorage = localForage.createInstance({
  name: 'EcommerceApp',
  storeName: 'cart'
});

// Инициализация хранилища
const initializeStorage = async () => {
  try {
    // Проверяем поддержку localForage
    await cartStorage.ready();
    console.log('Cart storage initialized');
  } catch (error) {
    console.error('Failed to initialize cart storage:', error);
  }
};

// Сохранение корзины в локальное хранилище
export const saveCart = async (cart) => {
  try {
    await cartStorage.setItem('cart', cart);
    return cart;
  } catch (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
};

// Загрузка корзины из локального хранилища
export const loadCart = async () => {
  try {
    const cart = await cartStorage.getItem('cart');
    return cart || { items: [], totalAmount: 0 };
  } catch (error) {
    console.error('Error loading cart:', error);
    return { items: [], totalAmount: 0 };
  }
};

// Очистка корзины в локальном хранилище
export const clearCartStorage = async () => {
  try {
    await cartStorage.removeItem('cart');
  } catch (error) {
    console.error('Error clearing cart storage:', error);
    throw error;
  }
};

// Инициализируем хранилище при импорте
initializeStorage();

export default {
  saveCart,
  loadCart,
  clearCartStorage
};