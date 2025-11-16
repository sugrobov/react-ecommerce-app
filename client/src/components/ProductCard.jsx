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

    const price = variations?.[0]?.price || 0;
    const productImages = images || [];
    const mainImage = productImages[0]?.image_url; // первое изображение

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

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 w-full group cursor-pointer"
            onClick={handleCardClick}
        >
            {mainImage && (
                <div className="relative overflow-hidden rounded-lg mb-4 h-48 flex items-center justify-center bg-gray-50 p-4">
                    {/* Основное изображение */}
                    <img
                        src={mainImage}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}

            {/* если изображения нет */}
            {!mainImage && (
                <div className="relative overflow-hidden rounded-lg mb-4 h-48 flex items-center justify-center bg-gray-100 p-4">
                    <span className="text-gray-400">Нет изображения</span>
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

