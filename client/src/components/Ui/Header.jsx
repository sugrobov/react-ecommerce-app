import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SearchBar from '../SearchBar';
import { setSearchQuery } from '../../store/uiSlice';

const Header = ({ onCartClick, onMenuToggle }) => {
    const dispatch = useDispatch();
    const { searchQuery } = useSelector(state => state.ui);

    const handleSearch = (query) => {
        dispatch(setSearchQuery(query));
    }

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Бургер-меню для мобильных */}
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <h1 className="text-xl font-semibold">Магазин</h1>

                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:block">
                            <SearchBar onSearch={handleSearch} />
                        </div>
                        <button
                            onClick={onCartClick}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Корзина
                        </button>
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