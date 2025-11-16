import React from "react";
import { useSelector } from "react-redux";
import Content from "../components/Ui/Content";
import ProductPage from "../components/ProductPage";

const HomePage = () => {
    const { selectedCategory, searchQuery } = useSelector(state => state.ui);
    return <Content categoryId={selectedCategory} searchQuery={searchQuery} />;
}

// Конфигурация маршрутов
export const ROUTES = {
    HOME: '/',
    PRODUCT: '/product/:id'

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
    }
];

// Хук для навигации
// export const useAppRoutes = () => {
//     return {
//         routes,
//         ROUTES
//     };
// };
