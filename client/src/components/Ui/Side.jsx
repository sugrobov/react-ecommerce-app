import React from 'react';
import CategoryList from '../CategoryList';

const Side = ({ selectedCategory, onSelectCategory, isOpen, onClose }) => {
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
        w-64 bg-white shadow-lg lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <h2 className="text-lg font-semibold">Меню</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            
            <CategoryList 
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
            />
            
            {/* Место для будущих фильтров */}
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-3 text-gray-500">Фильтры</h3>
              <p className="text-sm text-gray-400">Скоро здесь появятся фильтры...</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Side;