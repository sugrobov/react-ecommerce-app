import React from 'react';
import { useLocation } from 'react-router-dom';
import CategoryDropdown from '../CategoryDropdown';
import PriceFilter from './PriceFilter';
import Button from './Button';

const Side = ({ selectedCategory, onSelectCategory, isOpen, onClose }) => {

  const location = useLocation();

  const handleCategoryClick = (categoryId) => {
    onSelectCategory(categoryId);
    // Если мы на странице продукта, закрываем мобильное меню
    if (location.pathname.startsWith('/product/')) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay для мобильных */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Боковая панель */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-50 border-r border-gray-200 lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <h2 className="text-lg font-semibold">Меню</h2>
              <Button
                variant="outline"
                size="small"
                onClick={onClose}
                className="p-2!"
                aria-label="Закрыть меню"
              >
                ✕
              </Button>
            </div>

            <CategoryDropdown
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryClick}  // Используем обертку
            />

            {/* фильтры */}
            <div className="mt-6">
              <PriceFilter />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Side;