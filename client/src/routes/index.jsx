import React from "react";
import { useSelector } from "react-redux";
import Content from "../components/Ui/Content";
import ProductPage from "../components/ProductPage";
import OrdersPage from "../components/OrdersPage";
import FavoritesPage from "../components/FavoritesPage";

const HomePage = () => {
    const { selectedCategory, searchQuery } = useSelector(state => state.ui);
    return <Content categoryId={selectedCategory} searchQuery={searchQuery} />;
}

// Конфигурация маршрутов
export const ROUTES = {
    HOME: '/',
    PRODUCT: '/product/:id',
    ORDERPAGE: '/orders',
    FAVORITES: '/favorites',
}

export const routes = [
    {
        path: ROUTES.HOME,
        element: <HomePage />,
        label: 'Главная'
    },
    {
        path: ROUTES.PRODUCT,
        element: <ProductPage />,
        label: 'Товар'
    },
    {
        path: ROUTES.ORDERPAGE,
        element: <OrdersPage />,
        label: 'Заказы'
    },
    {
        path: ROUTES.FAVORITES,
        element: <FavoritesPage />,
        label: 'Избранное'
    }
];

// Хук для навигации
// export const useAppRoutes = () => {
//     return {
//         routes,
//         ROUTES
//     };
// };
