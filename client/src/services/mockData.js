const generateProductImage = (text, width = 300, height = 300) => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#4a5568"/>
      <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" 
            text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `)}`;
};

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
    },
    {
        id: 11,
        name: "Test_1",
        category_id: 4,
        description: "Очень"
    },
    {
        id: 12,
        name: "Test_2",
        category_id: 1,
        description: "Не очень"
    },
    {
        id: 13,
        name: "Test_3",
        category_id: 4,
        description: "Очень-Очень"
    },
    {
        id: 14,
        name: "Test_4",
        category_id: 1,
        description: "Не очень- не очень"
    },
    {
        id: 15,
        name: "Смартфон iPhone 15",
        category_id: 15,
        description: "Новый смартфон с улучшенной камерой"
    },
    {
        id: 16,
        name: "Ноутбук MacBook Pro",
        category_id: 16,
        description: "Мощный ноутбук для работы"
    },
    {
        id: 17,
        name: "Футболка хлопковая",
        category_id: 17,
        description: "Удобная футболка из натурального хлопка"
    },
    {
        id: 18,
        name: "Джинсы классические",
        category_id: 18,
        description: "Стильные джинсы на любой случай"
    },
    {
        id: 19,
        name: "JavaScript для начинающих",
        category_id: 19,
        description: "Книга по основам программирования"
    },
    {
        id: 20,
        name: "React руководство",
        category_id: 20,
        description: "Полное руководство по React"
    },
    {
        id: 21,
        name: "Беговая дорожка",
        category_id: 21,
        description: "Электрическая беговая дорожка"
    },
    {
        id: 22,
        name: "Гантели набор",
        category_id: 22,
        description: "Набор гантелей для тренировок"
    },
    {
        id: 23,
        name: "Кофемашина",
        category_id: 23,
        description: "Автоматическая кофемашина"
    },
    {
        id: 24,
        name: "Пылесос робот",
        category_id: 24,
        description: "Умный пылесос с навигацией"
    },
];

export const mockProductImages = [
    { id: 1, product_id: 1, image_url: generateProductImage("iPhone Front") },
    { id: 101, product_id: 1, image_url: generateProductImage("iPhone Back") },
    { id: 102, product_id: 1, image_url: generateProductImage("iPhone Side") },

    { id: 2, product_id: 2, image_url: generateProductImage("MacBook Open") },
    { id: 201, product_id: 2, image_url: generateProductImage("MacBook Closed") },

    { id: 3, product_id: 3, image_url: generateProductImage("T-Shirt") },
    { id: 4, product_id: 4, image_url: generateProductImage("Jeans") },
    { id: 5, product_id: 5, image_url: generateProductImage("JS Book") },
    { id: 6, product_id: 6, image_url: generateProductImage("React Book") },
    { id: 7, product_id: 7, image_url: generateProductImage("Treadmill") },
    { id: 8, product_id: 8, image_url: generateProductImage("Dumbbells") },
    { id: 9, product_id: 9, image_url: generateProductImage("Coffee+Machine") },
    { id: 10, product_id: 10, image_url: generateProductImage("Robot+Vacuum") },
    { id: 11, product_id: 11, image_url: generateProductImage("Bird") },
    { id: 12, product_id: 12, image_url: generateProductImage("Dog") },
    { id: 13, product_id: 13, image_url: generateProductImage("Cat") },
    { id: 14, product_id: 14, image_url: generateProductImage("Fish") },
    { id: 15, product_id: 15, image_url: generateProductImage("Toast") },
    { id: 16, product_id: 16, image_url: generateProductImage("Sample") },
    { id: 17, product_id: 17, image_url: generateProductImage("Digger") },
    { id: 18, product_id: 18, image_url: generateProductImage("Dotter") },
    { id: 19, product_id: 19, image_url: generateProductImage("Bath") },
    { id: 20, product_id: 20, image_url: generateProductImage("The ball") },
    { id: 21, product_id: 21, image_url: generateProductImage("Swimming") },
    { id: 22, product_id: 22, image_url: generateProductImage("Floating") },
    { id: 23, product_id: 23, image_url: generateProductImage("Jumper") },
    { id: 24, product_id: 24, image_url: generateProductImage("Adrenaline") },
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
    { id: 10, product_id: 10, price: 19990, stock: 10 },
    { id: 11, product_id: 11, price: 999, stock: 3 },
    { id: 12, product_id: 12, price: 99, stock: 2 },
    { id: 13, product_id: 13, price: 90, stock: 5 },
    { id: 14, product_id: 14, price: 19, stock: 28 },
    { id: 15, product_id: 15, price: 89990, stock: 15 },
    { id: 16, product_id: 16, price: 149990, stock: 8 },
    { id: 17, product_id: 17, price: 1990, stock: 50 },
    { id: 18, product_id: 18, price: 4990, stock: 30 },
    { id: 19, product_id: 19, price: 1290, stock: 25 },
    { id: 20, product_id: 20, price: 1590, stock: 20 },
    { id: 21, product_id: 21, price: 29990, stock: 5 },
    { id: 22, product_id: 22, price: 5990, stock: 40 },
    { id: 23, product_id: 23, price: 24990, stock: 12 },
    { id: 24, product_id: 24, price: 19990, stock: 10 },
];