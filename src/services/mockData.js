export const mockCategories = [
    { id: 1, name: "Электроника", description: "Гаджеты и устройства" },
    { id: 2, name: "Одежда", description: "Модная одежда" },
    { id: 3, name: "Книги", description: "Литература разных жанров" },
    { id: 4, name: "Спорт", description: "Спортивные товары" },
    { id: 5, name: "Дом", description: "Товары для дома" }
];

export const mockProducts = [
    {
        id: 1,
        name: "Смартфон iPhone 15",
        category_id: 1,
        description: "Новый смартфон с улучшенной камерой"
    },
    {
        id: 2,
        name: "Ноутбук MacBook Pro",
        category_id: 1,
        description: "Мощный ноутбук для работы"
    },
    {
        id: 3,
        name: "Футболка хлопковая",
        category_id: 2,
        description: "Удобная футболка из натурального хлопка"
    },
    {
        id: 4,
        name: "Джинсы классические",
        category_id: 2,
        description: "Стильные джинсы на любой случай"
    },
    {
        id: 5,
        name: "JavaScript для начинающих",
        category_id: 3,
        description: "Книга по основам программирования"
    },
    {
        id: 6,
        name: "React руководство",
        category_id: 3,
        description: "Полное руководство по React"
    },
    {
        id: 7,
        name: "Беговая дорожка",
        category_id: 4,
        description: "Электрическая беговая дорожка"
    },
    {
        id: 8,
        name: "Гантели набор",
        category_id: 4,
        description: "Набор гантелей для тренировок"
    },
    {
        id: 9,
        name: "Кофемашина",
        category_id: 5,
        description: "Автоматическая кофемашина"
    },
    {
        id: 10,
        name: "Пылесос робот",
        category_id: 5,
        description: "Умный пылесос с навигацией"
    }
];

export const mockProductImages = [
    { id: 1, product_id: 1, image_url: "https://via.placeholder.com/300x300?text=iPhone" },
    { id: 2, product_id: 2, image_url: "https://via.placeholder.com/300x300?text=MacBook" },
    { id: 3, product_id: 3, image_url: "https://via.placeholder.com/300x300?text=T-Shirt" },
    { id: 4, product_id: 4, image_url: "https://via.placeholder.com/300x300?text=Jeans" },
    { id: 5, product_id: 5, image_url: "https://via.placeholder.com/300x300?text=JS+Book" },
    { id: 6, product_id: 6, image_url: "https://via.placeholder.com/300x300?text=React+Book" },
    { id: 7, product_id: 7, image_url: "https://via.placeholder.com/300x300?text=Treadmill" },
    { id: 8, product_id: 8, image_url: "https://via.placeholder.com/300x300?text=Dumbbells" },
    { id: 9, product_id: 9, image_url: "https://via.placeholder.com/300x300?text=Coffee+Machine" },
    { id: 10, product_id: 10, image_url: "https://via.placeholder.com/300x300?text=Robot+Vacuum" }
];

export const mockProductVariations = [
    { id: 1, product_id: 1, price: 89990, stock: 15 },
    { id: 2, product_id: 2, price: 149990, stock: 8 },
    { id: 3, product_id: 3, price: 1990, stock: 50 },
    { id: 4, product_id: 4, price: 4990, stock: 30 },
    { id: 5, product_id: 5, price: 1290, stock: 25 },
    { id: 6, product_id: 6, price: 1590, stock: 20 },
    { id: 7, product_id: 7, price: 29990, stock: 5 },
    { id: 8, product_id: 8, price: 5990, stock: 40 },
    { id: 9, product_id: 9, price: 24990, stock: 12 },
    { id: 10, product_id: 10, price: 19990, stock: 10 }
];