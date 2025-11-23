import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { addItemToCart } from "../store/cartSlice";
import Button from "./Ui/Button";

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-lg mb-4 h-48 flex items-center justify-center bg-gray-100 p-4 flex-shrink-0">
                    <span className="text-gray-400">Нет изображения</span>
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

