import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

const CategoryList = ({ selectedCategory, onSelectCategory }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { data: categories, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: api.getCategories
    });

    const handleCategorySelect = (categoryId) => {
        onSelectCategory(categoryId);
        
        // Если мы на странице продукта, переходим на главную
        if (location.pathname.startsWith('/product/')) {
            navigate('/');
        }
    };

    if (isLoading) return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
        </div>
    );

    if (error) return <div className="text-red-500 text-sm">Ошибка загрузки категорий</div>;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4 hidden lg:block">Категории</h2>
            <div className="space-y-1">
                <button
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCategory === null
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100'
                        }`}
                >
                    Все товары
                </button>
                {categories?.map(category => (
                    <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCategory === category.id
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    )

}

export default CategoryList;