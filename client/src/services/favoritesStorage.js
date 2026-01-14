import localForage from 'localforage';
import { nanoid } from '@reduxjs/toolkit';

const favoritesStorage = localForage.createInstance({
  name: 'EcommerceApp',
  storeName: 'favorites'
});

// Инициализация хранилища
const initializeStorage = async () => {
  try {
    // Проверяем поддержку localForage
    await favoritesStorage.ready();
    console.log('Favorites storage initialized');
  } catch (error) {
    console.error('Failed to initialize favorites storage:', error);
  }
};

// Добавление товара в избранное
export const addFavorite = async (product) => {
  try {
    const favorites = await getAllFavorites();
    const existingFavorite = favorites.find(fav => fav.id === product.id);
    
    if (!existingFavorite) {
      const newFavorite = {
        id: product.id,
        addedAt: new Date().toISOString(),
        ...product
      };
      
      favorites.push(newFavorite);
      await favoritesStorage.setItem('favorites', favorites);
      return newFavorite;
    }
    
    return existingFavorite;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

// Удаление товара из избранного
export const removeFavorite = async (productId) => {
  try {
    const favorites = await getAllFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== productId);
    await favoritesStorage.setItem('favorites', updatedFavorites);
    return updatedFavorites;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

// Получение всех избранных товаров
export const getAllFavorites = async () => {
  try {
    const favorites = await favoritesStorage.getItem('favorites');
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

// Проверка, находится ли товар в избранном
export const isFavorite = async (productId) => {
  try {
    const favorites = await getAllFavorites();
    return favorites.some(fav => fav.id === productId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Очистка всех избранных товаров
export const clearFavorites = async () => {
  try {
    await favoritesStorage.removeItem('favorites');
  } catch (error) {
    console.error('Error clearing favorites:', error);
    throw error;
  }
};

// Инициализируем хранилище при импорте
initializeStorage();

export default {
  addFavorite,
  removeFavorite,
  getAllFavorites,
  isFavorite,
  clearFavorites
};