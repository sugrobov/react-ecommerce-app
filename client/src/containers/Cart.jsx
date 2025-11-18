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
        if (newQuantity < 1) return;
        dispatch(updateItemQuantity({ id, quantity: newQuantity }))
    }

    const handleRemove = (id) => {
        dispatch(removeItemFromCart(id));
    };

    if (showCheckout) {
        return <CheckoutForm onClose={() => setShowCheckout(false)} />;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl md:text-2xl font-bold">Корзина</h2>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={onClose}
                            className="!p-2"
                            aria-label="Закрыть корзину"
                        >
                            ✕
                        </Button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p className="text-lg mb-2">Корзина пуста</p>
                            <p className="text-sm">Добавьте товары из каталога</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-4">
                                        {/* Изображение товара */}
                                        {item.image && (
                                            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            </div>
                                        )}

                                        {/* Информация о товаре */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-base md:text-lg line-clamp-2 break-words">
                                                {item.name}
                                            </h3>
                                            <p className="text-blue-600 font-bold text-lg md:text-xl mt-1">
                                                {item.price} ₽
                                            </p>
                                        </div>

                                        {/* Управление количеством */}
                                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    className="!w-8 !h-8 !p-0 rounded-full flex-shrink-0"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </Button>
                                                <span className="w-8 text-center font-medium text-lg">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    className="!w-8 !h-8 !p-0 rounded-full flex-shrink-0"
                                                >
                                                    +
                                                </Button>
                                            </div>

                                            {/* Кнопка удаления */}
                                            <Button
                                                variant="danger"
                                                size="small"
                                                onClick={() => handleRemove(item.id)}
                                                className="flex-shrink-0"
                                            >
                                                <span className="hidden sm:inline">Удалить</span>
                                                <span className="sm:hidden">✕</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Итого и кнопки */}
                            <div className="border-t pt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg md:text-xl font-bold">Итого:</span>
                                    <span className="text-lg md:text-xl font-bold text-blue-600">
                                        {totalAmount} ₽
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
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

                            {/* Дополнительная информация */}
                            <div className="mt-4 text-center text-sm text-gray-500">
                                <p>В корзине {items.length} товар(ов)</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );


}

export default Cart;