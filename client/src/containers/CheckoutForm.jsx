import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../store/cartSlice";
import Button from "../components/Ui/Button";
import Input from "../components/Ui/Input";

const CheckoutForm = ({ onClose }) => {
    const dispatch = useDispatch();
    const { totalAmount } = useSelector(state => state.cart);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        time: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        dispatch(clearCart());
        onClose();

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
                            <Input
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
                            <Input
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
                            <Input
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
                            <Input
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
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Назад
                            </Button>
                            <button
                                type="submit"
                                variant="primary"
                                className="flex-1"
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
