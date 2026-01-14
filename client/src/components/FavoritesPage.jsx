import React, { useState, useEffect } from 'react';
import { getAllFavorites } from '../services/favoritesStorage';
import ProductCard from './ProductCard';
import PageHeader from './Ui/PageHeader';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await getAllFavorites();
        setFavorites(favs);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Избранное" />
        <div className="text-center py-12">
          <p className="text-gray-500">У вас пока нет избранных товаров</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Избранное" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;