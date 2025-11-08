import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../store/cartSlice";

const CheckoutForm = ({ onClose }) => {
    const dispatch = useDispatch();
    const { totalAmount } = useSelector(state => state.cart);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        time: ''
    });

    const handleSubmit = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Оформление заказа</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Имя *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Адрес *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Телефон *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Время доставки *
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold">Итого к оплате:</span>
                            <span className="text-lg font-bold">{totalAmount} ₽</span>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                            >
                                Назад
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                            >
                                Сделать заказ
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );

}

export default CheckoutForm;
