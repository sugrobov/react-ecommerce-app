import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCategory, setSearchQuery } from '../store/uiSlice';
// import CategoryList from '../components/CategoryList';
// import ProductList from './ProductList';
// import SearchBar from '../components/SearchBar';
// import Cart from './Cart';

import Header from '../components/Ui/Header';
import Side from '../components/Ui/Side';
import Content from '../components/Ui/Content';
import Footer from '../components/Ui/Footer';
import Cart from './Cart';

function App() {
  const dispatch = useDispatch();
  const { selectedCategory, searchQuery } = useSelector(state => state.ui);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleCategorySelect = useCallback((categoryId) => {
    dispatch(setCategory(categoryId));
    setShowMobileMenu(false); // Закрываем мобильное меню при выборе категории
  }, [dispatch]);

  const handleCartClick = useCallback(() => {
    setShowCart(true);
}, []);

  const handleMenuToggle = useCallback(() => {
    setShowMobileMenu(prev => !prev);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

    const handleCloseCart = useCallback(() => {
    setShowCart(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        onCartClick={handleCartClick}
        onMenuToggle={handleMenuToggle}
      />

      <div className="flex-1 flex">
        <Side
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          isOpen={showMobileMenu}
          onClose={handleCloseMobileMenu}
        />

        <Content
          categoryId={selectedCategory}
          searchQuery={searchQuery}
        />
      </div>

      <Footer />

      {showCart && (
        <Cart onClose={handleCloseCart} />
      )}
    </div>

  );

}

export default App;
