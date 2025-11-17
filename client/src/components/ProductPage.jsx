import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { api } from "../services/api";
import { addItemToCart } from "../store/cartSlice";
import Button from "./Ui/Button";

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);


    const { data: product, isLoading: productLoading, error: productError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => api.getProduct(id),
        enabled: !!id
    });

    const { data: variations, isLoading: variationsLoading } = useQuery({
        queryKey: ['variations', id],
        queryFn: () => api.getProductVariations([id]),
        enabled: !!id
    });

    const { data: images, isLoading: imagesLoading } = useQuery({
        queryKey: ['images', id],
        queryFn: () => api.getProductImages([id]),
        enabled: !!id
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.getCategories()
    });

    const handleAddToCart = () => {
        if (product && variations?.[0]) {
            dispatch(addItemToCart({
                id: product.id,
                name: product.name,
                price: variations[0].price,
                image: images?.[0]?.image_url
            }));
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    if (productLoading || variationsLoading || imagesLoading) return
    (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="text-center py-8">Загрузка...</div>
        </div>
    );

    if (productError || !product) {
        return (
            <div className="container mx-auto p-4 max-w-6xl">
                <div className="text-center py-8 text-red-500">
                    Товар не найден
                </div>
            </div>
        );
    }

    const price = variations?.[0]?.price || 0;
    const productImages = images || [];
    const category = categories?.find(cat => cat.id === product.category_id);

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === productImages.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? productImages.length - 1 : prev - 1
        );
    };

    const selectImage = (index) => {
        setCurrentImageIndex(index);
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            {/* Кнопка "Назад" к странице */}
            <Button
                variant="outline"
                size="small"
                onClick={handleBackClick}
                className="mb-4 flex items-center"
            >
                ← Назад
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Блок с изображениями */}
                <div>
                    {productImages.length > 0 && (
                        <div className="space-y-4">
                            {/* Контейнер для изображения и кнопок навигации */}
                            <div className="flex items-center justify-between space-x-4">
                                {/* Кнопка "Назад" для изображений */}
                                {productImages.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={prevImage}
                                        className="!w-12 !h-12 !p-0 rounded-full shadow-lg flex-shrink-0 bg-white/90 hover:bg-white backdrop-blur-sm"
                                        aria-label="Предыдущее изображение"
                                    >
                                        ‹
                                    </Button>
                                )}

                                {/* Основное изображение */}
                                <div className="relative overflow-hidden rounded-lg bg-gray-50 h-80 flex-1 flex items-center justify-center p-4">
                                    <img
                                        src={productImages[currentImageIndex]?.image_url}
                                        alt={product.name}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>

                                {/* Кнопка "Вперед" для изображений */}
                                {productImages.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="small"
                                        onClick={nextImage}
                                        className="!w-12 !h-12 !p-0 rounded-full shadow-lg flex-shrink-0 bg-white/90 hover:bg-white backdrop-blur-sm"
                                        aria-label="Следующее изображение"
                                    >
                                        ›
                                    </Button>
                                )}
                            </div>

                            {/* Превью миниатюр */}
                            {productImages.length > 1 && (
                                <div className="flex justify-center space-x-3">
                                    {productImages.map((image, index) => (
                                        <Button
                                            key={image.id}
                                            variant="outline"
                                            size="small"
                                            onClick={() => selectImage(index)}
                                            className={`!w-16 !h-16 !p-0 rounded-lg border-2 transition-all ${index === currentImageIndex
                                                ? 'border-blue-500 scale-105'
                                                : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            <img
                                                src={image.image_url}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Блок с информацией о продукте */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {product.name}
                        </h1>
                        {category && (
                            <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                {category.name}
                            </div>
                        )}
                    </div>

                    <div className="text-3xl font-bold text-blue-600">
                        {price} ₽
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Описание</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Оценка</h3>
                        <div className="flex items-center">
                            <div className="flex text-yellow-400">
                                {"★".repeat(5)}
                            </div>
                            <span className="ml-2 text-gray-600">
                                (Нет отзывов)
                            </span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            variant="product"
                            size="xlarge"
                            onClick={handleAddToCart}
                            className="transform hover:scale-105 transition-transform"
                        >
                            Добавить в корзину
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default ProductPage;