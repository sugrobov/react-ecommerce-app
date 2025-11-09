import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeItemFromCart, updateItemQuantity, clearCart } from "../store/cartSlice";
import CheckoutForm from "./CheckoutForm";
import Button from "../components/Ui/Button";


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
                        <Button
                            variant="outline"
                            size="small"
                            onClick={onClose}
                            className="!p-2"
                        >
                            ✕
                        </Button>
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
                                            <Button
                                                variant="outline"
                                                size="small"
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                className="!w-8 !h-8 !p-0 rounded-full"
                                            >
                                                -
                                            </Button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="small"
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className="!w-8 !h-8 !p-0 rounded-full"
                                            >
                                                +
                                            </Button>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size="small"
                                            onClick={() => handleRemove(item.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold">Итого:</span>
                                    <span className="text-xl font-bold">{totalAmount} ₽</span>
                                </div>

                                <div className="flex space-x-4">
                                    <Button
                                        variant="secondary"
                                        onClick={() => dispatch(clearCart())}
                                        className="flex-1"
                                    >
                                        Очистить корзину
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowCheckout(true)}
                                        className="flex-1"
                                    >
                                        Оформить заказ
                                    </Button>
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