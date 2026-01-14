import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { addItemToCart } from "../store/cartSlice";
import { isFavorite, addFavorite, removeFavorite } from "../services/favoritesStorage";
import Button from "./Ui/Button";

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isFav, setIsFav] = useState(false);

    // const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { data: variations } = useQuery({
        queryKey: ['variations', product.id],
        queryFn: () => api.getProductVariations([product.id]),
        enabled: !!product.id
    });

    const { data: images } = useQuery({
        queryKey: ['images', product.id],
        queryFn: () => api.getProductImages([product.id]),
        enabled: !!product.id
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.getCategories()
    });

    // Проверяем, находится ли товар в избранном при загрузке компонента
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            const favStatus = await isFavorite(product.id);
            setIsFav(favStatus);
        };
        
        checkFavoriteStatus();
    }, [product.id]);

    const price = variations?.[0]?.price || 0;
    const productImages = images || [];
    const mainImage = productImages[0]?.image_url; // первое изображение

    const category = categories?.find(cat => cat.id === product.category_id);

    const handleAddToCard = (e) => {
        e.stopPropagation();
        dispatch(addItemToCart({
            id: product.id,
            name: product.name,
            price: price,
            image: mainImage
        }))
    }

    const handleCardClick = () => {
        navigate(`/product/${product.id}`); // Переход на страницу продукта
    };

    // Обработчик клика по иконке избранного
    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        
        try {
            if (isFav) {
                await removeFavorite(product.id);
            } else {
                await addFavorite(product);
            }
            setIsFav(!isFav);
        } catch (error) {
            console.error('Error updating favorite status:', error);
        }
    };

    // функция для обрезки текста
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 w-full group cursor-pointer flex flex-col h-full"
            onClick={handleCardClick}
        >
            {/* Блок изображения */}
            {mainImage ? (
                <div className="relative overflow-hidden rounded-lg mb-4 h-48 flex items-center justify-center bg-gray-50 p-4 flex-shrink-0">
                    <img
                        src={mainImage}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Иконка избранного */}
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                        aria-label={isFav ? "Удалить из избранного" : "Добавить в избранное"}
                    >
                        {isFav ? (
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        )}
                    </button>
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-lg mb-4 h-48 flex items-center justify-center bg-gray-100 p-4 flex-shrink-0">
                    <span className="text-gray-400">Нет изображения</span>
                    {/* Иконка избранного */}
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                        aria-label={isFav ? "Удалить из избранного" : "Добавить в избранное"}
                    >
                        {isFav ? (
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        )}
                    </button>
                </div>
            )}

            {/* Блок контента с фиксированной высотой */}
            <div className="flex flex-col flex-grow min-h-0">
                {/* Название товара - максимум 2 строки */}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                    {truncateText(product.name, 60)}
                </h3>

                {/* Категория товара */}
                {category && (
                    <div className="mb-2">
                        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {category.name}
                        </span>
                    </div>
                )}
                
                {/* Описание - максимум 3 строки */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {product.description ? truncateText(product.description, 120) : 'Описание отсутствует'}
                </p>

                {/* Цена и кнопка - всегда внизу */}
                <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="text-xl font-bold text-blue-600">{price} ₽</span>
                    <Button
                        variant="success"
                        size="small"
                        onClick={handleAddToCard}
                    >
                        В корзину
                    </Button>
                </div>
            </div>
        </div>
    )

}

export default ProductCard;
