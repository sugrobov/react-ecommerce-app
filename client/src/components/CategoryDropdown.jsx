import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { useDebounce } from "../hooks/useDebounce";
import Button from "./Ui/Button";


const CategoryDropdown = ({ selectedCategory, onSelectCategory }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const debouncedSearch = useDebounce(searchTerm, 300);

    const { data: categories, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: api.getCategories
    });

    // Фильтрация категорий по поисковому запросу
    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter(category =>
            category.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [categories, debouncedSearch]);

    const selectedCategoryName = categories?.find(cat => cat.id === selectedCategory)?.name || "Все товары";

    const handleCategorySelect = (categoryId) => {
        onSelectCategory(categoryId);
        setIsOpen(false);
        setSearchTerm("");

        // Если мы на странице продукта, переходим на главную
        if (location.pathname.startsWith('/product/')) {
            navigate('/');
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        setSearchTerm("");
    };

    const handleReset = () => {
    onSelectCategory(null);
    setIsOpen(false);
    setSearchTerm("");
};

    if (error) return <div className="text-red-500 text-sm">Ошибка загрузки категорий</div>;

    return (
        <div className="relative w-full">
            <h2 className="text-lg font-semibold mb-2 hidden lg:block">Категории</h2>

            {/* Основная кнопка для открытия dropdown */}
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="medium"
                    onClick={handleToggle}
                    className="w-full flex justify-between items-center !px-4 !py-2"
                >
                    <span className="truncate text-left">{selectedCategoryName}</span>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </Button>
                
                {/* Кнопка сброса */}
                {selectedCategory !== null && (
                    <Button
                        variant="outline"
                        size="small"
                        onClick={handleReset}
                        className="!px-3 !py-2 flex-shrink-0"
                        title="Сбросить категорию"
                        aria-label="Сбросить категорию"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                )}
            </div>

            {/* Dropdown меню */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Поле поиска */}
                    <div className="p-2 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Поиск категорий..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            autoFocus
                        />
                    </div>

                    {/* Список категорий */}
                    <div className="py-1">
                        {isLoading ? (
                            <div className="px-4 py-2 text-sm text-gray-500 text-left">Загрузка...</div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-500 text-left">Категории не найдены</div>
                        ) : (
                            <>
                                {/* Опция "Все товары" */}
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={() => handleCategorySelect(null)}
                                    className={`w-full !justify-start !px-4 !py-2 text-sm rounded-none border-0 text-left ${selectedCategory === null
                                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                            : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Все товары
                                </Button>

                                {/* Список категорий */}
                                {filteredCategories.map(category => (
                                    <Button
                                        key={category.id}
                                        variant="outline"
                                        size="small"
                                        onClick={() => handleCategorySelect(category.id)}
                                        className={`w-full !justify-start !px-4 !py-2 text-sm rounded-none border-0 text-left ${selectedCategory === category.id
                                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoryDropdown;