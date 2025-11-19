import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { setCategory } from '../store/uiSlice';

import Header from '../components/Ui/Header';
import Side from '../components/Ui/Side';
// import Content from '../components/Ui/Content';
import Footer from '../components/Ui/Footer';
import Cart from './Cart';
import { routes } from '../routes/index';

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

        <main className="flex-1 p-4">
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </main>
      </div>

      <Footer />

      {showCart && (
        <Cart onClose={handleCloseCart} />
      )}
    </div>

  );

}

export default App;
