import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import InfiniteScroll from "../components/InfiniteScroll";

const ProductList = ({ categoryId, searchQuery }) => {
    const priceFilter = useSelector(state => state.ui.priceFilter); // Получаем фильтр цен из Redux store

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error
    } = useInfiniteQuery({
        queryKey: ['products', categoryId, searchQuery, priceFilter], // добавили priceFilter в ключи

        queryFn: ({ pageParam = 0 }) => {
            const filters = categoryId ? { category_id: categoryId } : {};
            if (priceFilter && priceFilter.type !== 'any') {    // добавили проверку на фильтрацию по цене
                filters.priceFilter = priceFilter;
            }
            return api.getProducts([pageParam, pageParam + 9], filters, searchQuery)
        },

        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 10) return undefined;
            return allPages.length * 10;
        },
        // стабилизация во избежания дублирования запросов
        staleTime: 5 * 60 * 1000, // 5 минут
    });

    const products = data?.pages.flat() || [];

    if (status === 'loading') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                        <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                        <div className="h-10 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (status === 'error') {
        return <div className="text-center text-red-500">Ошибка загрузки товаров: {error.message}</div>;
    }

    return (
        <div className="w-full">
            {products.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    Товары не найдены
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <InfiniteScroll
                        onLoadMore={fetchNextPage}
                        hasMore={hasNextPage}
                        loading={isFetchingNextPage}
                    />
                </>
            )}
        </div>
    );
};

export default ProductList;