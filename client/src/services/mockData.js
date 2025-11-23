
const generateProductImage = (text, width = 300, height = 300) => {

    const colorPalette = [
    '#4a5568', // серый (оригинальный)
    '#2d3748', // темно-серый
    '#3182ce', // синий
    '#2b6cb0', // темно-синий
    '#38a169', // зеленый
    '#2f855a', // темно-зеленый
    '#dd6b20', // оранжевый
    '#c05621', // темно-оранжевый
    '#d53f8c', // розовый
    '#b83280', // темно-розовый
    '#805ad5', // фиолетовый
    '#6b46c1', // темно-фиолетовый
    '#e53e3e', // красный
    '#c53030', // темно-красный
    '#319795', // бирюзовый
    '#2c7a7b', // темно-бирюзовый
  ];

  const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${randomColor}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" 
            text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `)}`;
};

const generateLongText = (type, wordCount = 10) => {
  const words = {
    tech: ['смартфон', 'процессор', 'память', 'экран', 'камера', 'батарея', 'операционная', 'система', 'приложение', 'интерфейс', 'сенсорный', 'высококачественный', 'инновационный', 'технология', 'функция'],
    fashion: ['стильный', 'модный', 'комфортный', 'качественный', 'трендовый', 'уникальный', 'дизайн', 'материал', 'размер', 'цвет', 'коллекция', 'бренд'],
    general: ['отличный', 'превосходный', 'удивительный', 'невероятный', 'потрясающий', 'качественный', 'надежный', 'долговечный', 'практичный', 'функциональный']
  };
  
  const selectedWords = words[type] || words.general;
  let result = '';
  
  for (let i = 0; i < wordCount; i++) {
    result += selectedWords[Math.floor(Math.random() * selectedWords.length)] + ' ';
  }
  
  return result.trim();
};

const generateLongName = (baseName) => {
  const prefixes = ['Супер-', 'Мега-', 'Ультра-', 'Премиум ', 'Люкс ', 'Профессиональный '];
  const suffixes = [' Pro', ' Max', ' Plus', ' Ultra', ' Deluxe', ' Premium'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return prefix + baseName + suffix + ' с расширенными функциями и улучшенными характеристиками';
};

const generateLongDescription = () => {
  const descriptions = [
    'Этот продукт предлагает непревзойденное качество и инновационные технологии. ' +
    'Идеально подходит для современных пользователей, которые ценят надежность и функциональность. ' +
    'Создан с использованием передовых материалов и проверенных временем решений.',
    
    'Инновационный дизайн сочетается с практичностью и удобством использования. ' +
    'Данная модель включает в себя все последние технологические достижения и разработана с учетом пожеланий потребителей. ' +
    'Отличное соотношение цены и качества делает этот продукт лидером рынка.',
    
    'Премиальное качество сборки и внимание к деталям выделяют этот продукт среди аналогов. ' +
    'Эргономичный дизайн и продуманная функциональность обеспечивают максимальный комфорт при использовании. ' +
    'Гарантия производителя и сервисная поддержка по всей стране.'
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)] + 
         ' Этот товар обязательно понравится вам своими выдающимися характеристиками и превосходным исполнением.';
};


export const mockCategories = [
    { id: 1, name: "Электроника", description: "Гаджеты и устройства lorem" },
    { id: 2, name: "Одежда", description: "Модная одежда" },
    { id: 3, name: "Книги", description: "Литература разных жанров" },
    { id: 4, name: "Спорт", description: "Спортивные товары" },
    { id: 5, name: "Дом", description: "Товары для дома" }
];

export const mockProducts = [
    {
        id: 1,
        name: generateLongName("Смартфон iPhone 15"),
        category_id: 1,
        description: generateLongDescription()
    },
    {
        id: 2,
        name: generateLongName("Ноутбук MacBook Pro"),
        category_id: 1,
        description: generateLongDescription()
    },
    {
        id: 3,
        name: generateLongName("Футболка хлопковая"),
        category_id: 2,
        description: generateLongDescription()
    },
    {
        id: 4,
        name: generateLongName("Джинсы классические"),
        category_id: 2,
        description: generateLongDescription()
    },
    {
        id: 5,
        name: generateLongName("JavaScript для начинающих"),
        category_id: 3,
        description: generateLongDescription()
    },
    {
        id: 6,
        name: "Смартфон iPhone 15",
        category_id: 1,
        description: "Новый смартфон с улучшенной камерой"
    },
    {
        id: 7,
        name: "Ноутбук MacBook Pro",
        category_id: 1,
        description: "Мощный ноутбук для работы"
    },
    {
        id: 8,
        name: "Футболка хлопковая",
        category_id: 2,
        description: "Удобная футболка из натурального хлопка"
    },
    {
        id: 9,
        name: "Джинсы классические",
        category_id: 2,
        description: "Стильные джинсы на любой случай"
    },
    {
        id: 10,
        name: "JavaScript для начинающих",
        category_id: 3,
        description: "Книга по основам программирования"
    },
    {
        id: 11,
        name: "React руководство",
        category_id: 3,
        description: "Полное руководство по React"
    },
    {
        id: 12,
        name: "Беговая дорожка",
        category_id: 4,
        description: "Электрическая беговая дорожка"
    },
    {
        id: 13,
        name: "Гантели набор",
        category_id: 4,
        description: "Набор гантелей для тренировок"
    },
    {
        id: 14,
        name: "Кофемашина",
        category_id: 5,
        description: "Автоматическая кофемашина"
    },
    {
        id: 15,
        name: "Пылесос робот",
        category_id: 5,
        description: "Умный пылесос с навигацией"
    },
    {
        id: 16,
        name: "Test_1",
        category_id: 4,
        description: "Очень"
    },
    {
        id: 17,
        name: "Test_2",
        category_id: 1,
        description: "Не очень"
    },
    {
        id: 18,
        name: "Test_3",
        category_id: 4,
        description: "Очень-Очень"
    },
    {
        id: 19,
        name: "Test_4",
        category_id: 1,
        description: "Не очень- не очень"
    },
    {
        id: 20,
        name: "Смартфон iPhone 15",
        category_id: 15,
        description: "Новый смартфон с улучшенной камерой"
    },
    {
        id: 21,
        name: "Ноутбук MacBook Pro",
        category_id: 16,
        description: "Мощный ноутбук для работы"
    },
    {
        id: 22,
        name: "Футболка хлопковая",
        category_id: 17,
        description: "Удобная футболка из натурального хлопка"
    },
    {
        id: 23,
        name: "Джинсы классические",
        category_id: 18,
        description: "Стильные джинсы на любой случай"
    },
    {
        id: 24,
        name: "JavaScript для начинающих",
        category_id: 19,
        description: "Книга по основам программирования"
    },
    {
        id: 25,
        name: "React руководство",
        category_id: 20,
        description: "Полное руководство по React"
    },
    {
        id: 26,
        name: "Беговая дорожка",
        category_id: 21,
        description: "Электрическая беговая дорожка"
    },
    {
        id: 27,
        name: "Гантели набор",
        category_id: 22,
        description: "Набор гантелей для тренировок"
    },
    {
        id: 28,
        name: "Кофемашина",
        category_id: 23,
        description: "Автоматическая кофемашина"
    },
    {
        id: 29,
        name: "Пылесос робот",
        category_id: 24,
        description: "Умный пылесос с навигацией"
    },
     {
        id: 30,
        name: "Очень длинное название товара которое не помещается в одну строку и должно быть обрезано с помощью line-clamp",
        category_id: 4,
        description: "Это очень длинное описание товара которое должно быть обрезано и показано в несколько строк но не более трех иначе будет обрезано это описание содержит много слов и должно быть достаточно длинным чтобы проверить работу line-clamp и убедиться что обрезка текста работает корректно на всех устройствах и разрешениях экрана"
    },
    {
        id: 31,
        name: "Еще один товар с невероятно длинным названием которое точно не поместится в отведенное пространство карточки товара",
        category_id: 1,
        description: "Еще одно очень длинное описание для тестирования функциональности обрезки текста в карточках товаров и на странице продукта чтобы убедиться что интерфейс остается чистым и аккуратным даже при наличии контента большой длины который может испортить верстку если не будет properly обрезан"
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
    { id: 25, product_id: 25, image_url: generateProductImage("One") },
    { id: 26, product_id: 26, image_url: generateProductImage("Two") },
    { id: 27, product_id: 27, image_url: generateProductImage("Three") },
    { id: 28, product_id: 28, image_url: generateProductImage("Four") },
    { id: 29, product_id: 29, image_url: generateProductImage("Five") },
    { id: 30, product_id: 30, image_url: generateProductImage("Two") },
    { id: 31, product_id: 31, image_url: generateProductImage("Three") },

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
    { id: 25, product_id: 25, price: 19990, stock: 10 },
    { id: 26, product_id: 26, price: 19990, stock: 10 },
    { id: 27, product_id: 27, price: 19990, stock: 10 },
    { id: 28, product_id: 28, price: 19990, stock: 10 },
    { id: 29, product_id: 29, price: 19990, stock: 10 },
    { id: 30, product_id: 30, price: 19990, stock: 10 },
    { id: 31, product_id: 31, price: 19990, stock: 10 },
    
];