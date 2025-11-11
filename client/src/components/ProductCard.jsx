import React from "react";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { addItemToCart } from "../store/cartSlice";
import Button from "./Ui/Button";

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();

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
    const imageUrl = images?.[0]?.image_url;

    const handleAddToCard = () => {
        dispatch(addItemToCart({
            id: product.id,
            name: product.name,
            price: price,
            image: imageUrl
        }))
    }

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 w-full group">
            {imageUrl && (
                <div className="overflow-hidden rounded-lg mb-4 h-48 flex items-center justify-center bg-gray-50 p-4">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                </div>
            )}
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4  line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">{price}</span>
                <Button
                    variant="success"
                    size="small"
                    onClick={handleAddToCard}
                >В корзину</Button>
            </div>

        </div>
    )

}

export default ProductCard;

