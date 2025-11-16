import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { addItemToCart } from "../store/cartSlice";
import Button from "./Ui/Button";

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
     const navigate = useNavigate();
     
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    const price = variations?.[0]?.price || 0;
    const productImages = images || [];

    const handleAddToCard = (e) => {
        e.stopPropagation();
        dispatch(addItemToCart({
            id: product.id,
            name: product.name,
            price: price,
            image: productImages[currentImageIndex]?.image_url
        }))
    }

        const handleCardClick = () => {
        navigate(`/product/${product.id}`); // Переход на страницу продукта
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => 
            prev === productImages.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => 
            prev === 0 ? productImages.length - 1 : prev - 1
        );
    };

    const selectImage = (index, e) => {
        e.stopPropagation();
        setCurrentImageIndex(index);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 w-full group cursor-pointer"
        onClick={handleCardClick}
        >
            {productImages.length > 0 && (
                <div className="relative overflow-hidden rounded-lg mb-4 h-48 flex items-center justify-center bg-gray-50 p-4">
                    {/* Основное изображение */}
                    <img
                        src={productImages[currentImageIndex]?.image_url}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Навигационные стрелки (если > 1 изображения) */}
                     {productImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all"
                                aria-label="Предыдущее изображение"
                            >
                                ‹
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all"
                                aria-label="Следующее изображение"
                            >
                                ›
                            </button>
                        </>
                    )} 
                </div>
            )}

            {/* Превью миниатюр (только если > 1 изображения) */}
             {productImages.length > 1 && (
                <div className="flex justify-center space-x-2 mb-4">
                    {productImages.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={(e) => selectImage(index, e)}
                            className={`w-10 h-10 rounded border-2 transition-all ${
                                index === currentImageIndex 
                                    ? 'border-blue-500 scale-110' 
                                    : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <img
                                src={image.image_url}
                                alt={`${product.name} ${index + 1}`}
                                className="w-full h-full object-cover rounded"
                            />
                        </button>
                    ))}
                </div>
            )} 

            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center">
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
    )

}

export default ProductCard;

