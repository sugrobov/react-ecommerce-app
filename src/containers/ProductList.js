import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import InfiniteScroll from "../components/InfiniteScroll";

const ProductList = ({ categoryId, searchQuery }) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: ['products', categoryId, searchQuery],
        queryFn: ({ pageParam = 0 }) => {
            const filters = categoryId ? { category_id: categoryId } : {};
            return api.getProducts([pageParam, pageParam + 9], filters, searchQuery)
        },
        getNextPageParam: (lastsPage, allPages) => {
            if (lastsPage.length < 10) return undefined;
            return allPages.length * 10;
        },
    });

    const products = data?.pages.flat() || [];
    if (status === 'loading') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        return <div className="text-center text-red-500">Ошибка загрузки товаров</div>;
    }

    return (
        <div>
            {products.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    Товары не найдены
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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