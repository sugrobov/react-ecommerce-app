import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCategory, setSearchQuery } from '../store/uiSlice';
import CategoryList from '../components/CategoryList';
import ProductList from './ProductList';
import SearchBar from '../components/SearchBar';
import Cart from './Cart';

function App() {
  const dispatch = useDispatch();
  const { selectedCategory, searchQuery } = useSelector(state => state.ui);
  const [showCart, setShowCart] = useState(false);

  const handleCategorySelect = (categoryId) => {
    dispatch(setCategory(categoryId));
  };

  const handleSearch = (query) => {
    dispatch(setSearchQuery(query));
  };


  return (
        <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Магазин</h1>
            <div className="flex items-center space-x-4">
              <SearchBar onSearch={handleSearch} />
              <button 
                onClick={() => setShowCart(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Корзина
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-1/4">
            <CategoryList 
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          </aside>
          
          <main className="lg:w-3/4">
            <ProductList 
              categoryId={selectedCategory}
              searchQuery={searchQuery}
            />
          </main>
        </div>
      </div>

      {showCart && (
        <Cart onClose={() => setShowCart(false)} />
      )}
    </div>
  
  );

}

export default App;
