import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SearchBar from '../SearchBar';
import { setSearchQuery } from '../../store/uiSlice';
import Button from './Button';

const Header = ({ onCartClick, onMenuToggle }) => {
    const dispatch = useDispatch();
    // const { searchQuery } = useSelector(state => state.ui);

    // Обработчик поиска - используем useCallback для оптимизации 
    const { items } = useSelector(state => state.cart); // Получаем товары из корзины
       // Вычисляем общее количество товаров в корзине
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const handleSearch = useCallback((query) => {
        dispatch(setSearchQuery(query));
    }, [dispatch]);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Бургер-меню для мобильных */}
                    <Button
                        variant="outline"
                        size="small"
                        onClick={onMenuToggle}
                        className="lg:hidden !p-2"
                        aria-label="Открыть меню"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </Button>

                    <h1 className="text-xl font-semibold">Магазин</h1>

                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:block">
                            <SearchBar onSearch={handleSearch} />
                        </div>
                        <Button
                            variant="primary"
                            onClick={onCartClick}
                            badge={totalItems} // количество товаров в корзине
                            className="relative"
                        >
                            Корзина
                        </Button>
                    </div>
                </div>

                {/* Поиск для мобильных */}
                <div className="sm:hidden pb-4">
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>
        </header>

    )
}

export default Header;