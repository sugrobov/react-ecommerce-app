import { createSlice } from "@reduxjs/toolkit";
import { saveCart } from "../services/cartStorage";

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],  // items
        totalAmount: 0 // сумма
    },
    reducers: {
        addItemToCart: (state, action) => {
            const newItem = action.payload;
            const existingItem = state.items.find(item => item.id === newItem.id); // есть ли товар в корзине?

            if (existingItem) {
                existingItem.quantity += 1 // да - увеличиваем кол-во
            } else {
                state.items.push({
                    ...newItem,
                    quantity: 1
                })
            }
            //  обновляем сумму
            state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0)

            // Сохраняем корзину в локальное хранилище
            saveCart({ items: state.items, totalAmount: state.totalAmount });
        },
        removeItemFromCart: (state, action) => {
            const id = action.payload;
            state.items = state.items.filter(item => item.id !== id); // убираем товар item.id !== id
            //  обновляем сумму
            state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

            // Сохраняем корзину в локальное хранилище
            saveCart({ items: state.items, totalAmount: state.totalAmount });
        },
        updateItemQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const existingItem = state.items.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity = quantity;
                // Если количество стало 0 или отрицательным, удаляем товар из корзины
                if (existingItem.quantity <= 0) {
                    state.items = state.items.filter(item => item.id !== id);
                }
            }
            //  обновляем сумму
            state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

            // Сохраняем корзину в локальное хранилище
            saveCart({ items: state.items, totalAmount: state.totalAmount });
        },
        clearCart: (state) => {
            state.items = [];
            state.totalAmount = 0

            // Очищаем корзину в локальном хранилище
            saveCart({ items: [], totalAmount: 0 });
        },
        // Новый редьюсер для загрузки корзины из локального хранилища
        loadCartFromStorage: (state, action) => {
            const { items, totalAmount } = action.payload;
            state.items = items || [];
            state.totalAmount = totalAmount || 0;
        }
    }

});

export const { addItemToCart, removeItemFromCart, updateItemQuantity, clearCart, loadCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer;