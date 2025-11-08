import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeItemFromCart, updateItemQuantity, clearCart } from "../store/cartSlice";
import CheckoutForm  from "./CheckoutForm";


const Cart = ({ onClose }) => {
    const { items, totalAmount } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const [showCheckout, setShowCheckout] = useState(false);

    const handleQuantityChange = (id, newQuantity) => {
        dispatch(updateItemQuantity({ id, quantity: newQuantity }))
    }

    const handleRemove = (id) => {
        dispatch(removeItemFromCart(id));
    };

    if (showCheckout) {
        return <CheckoutForm onClose={() => setShowCheckout(false)} />;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Корзина</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ✕
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Корзина пуста</p>
                    ) : (
                        <>
                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-blue-600 font-bold">{item.price} ₽</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold">Итого:</span>
                                    <span className="text-xl font-bold">{totalAmount} ₽</span>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => dispatch(clearCart())}
                                        className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                                    >
                                        Очистить корзину
                                    </button>
                                    <button
                                        onClick={() => setShowCheckout(true)}
                                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                                    >
                                        Оформить заказ
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );


}

export default Cart;