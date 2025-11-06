import { createSlice } from "@reduxjs/toolkit";

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

        },
        removeItemFromCart: (state, action) => {
            const id = action.payload;
            state.items = state.items.filter(item => item.id !== id); // убираем товар item.id !== id
            //  обновляем сумму
            state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

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

        },
        clearCart: (state) => {
            state.items = [];
            state.totalAmount = 0
        }
    }

});

export const { addItemToCart, removeItemFromCart, updateItemQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;