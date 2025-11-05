import React from "react";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { addItemToCart } from "../store/cartSlice";

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
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                />
            )}
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">{price}</span>
                <button
                    onClick={handleAddToCard}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >В корзину</button>
            </div>

        </div>
    )

}

export default ProductCard;

