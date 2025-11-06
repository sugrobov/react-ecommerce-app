import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

const CategoryList = ({ selectedCategory, onSelectCategory }) => {
    const { data: categories, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: api.getCategories
    });

    if (isLoading) return <div className="animate-pulse">Загрузка категорий...</div>;
    if (error) return <div>Ошибка загрузки категорий</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Категории</h2>
            <button
                onClick={() => onSelectCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-2 ${selectedCategory === null
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
            >
                Все товары
            </button>
            {categories?.map(category => (
                <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-2 ${selectedCategory === category.id
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
    )

}