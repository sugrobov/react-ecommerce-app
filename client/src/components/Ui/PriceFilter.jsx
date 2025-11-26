import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPriceFilter, clearPriceFilter } from "../../store/uiSlice";
import Button from "./Button";
import Input from "./Input";

const PriceFilter = () => {
    const dispatch = useDispatch();
    const currentPriceFilter = useSelector(state => state.ui.priceFilter);

    const [filterType, setFilterType] = useState(currentPriceFilter.type);
    const [minPrice, setMinPrice] = useState(currentPriceFilter.min || '');
    const [maxPrice, setMaxPrice] = useState(currentPriceFilter.max || '');

    useEffect(() => {
        setFilterType(currentPriceFilter.type);
        setMinPrice(currentPriceFilter.min || '');
        setMaxPrice(currentPriceFilter.max || '');
    }, [currentPriceFilter]);

    const handleApplyFilter = () => {
        const filter = {
            type: filterType,
            min: filterType === 'range' || filterType === 'greater' ? Number(minPrice) : null,
            max: filterType === 'range' || filterType === 'less' ? Number(maxPrice) : null
        };
        dispatch(setPriceFilter(filter));
    };

    const handleClearFilter = () => {
        setFilterType('any');
        setMinPrice('');
        setMaxPrice('');
        dispatch(clearPriceFilter());
    };

    const handleTypeChange = (type) => {
        setFilterType(type);
        // Очищаем поля при смене типа
        if (type === 'any') {
            setMinPrice('');
            setMaxPrice('');
        }
    };

    const isApplyDisabled = (filterType === 'less' && !maxPrice) ||
        (filterType === 'greater' && !minPrice) ||
        (filterType === 'range' && (!minPrice || !maxPrice));

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Фильтр по цене</h3>

            {/* Выбор типа фильтра */}
            <div className="space-y-2 mb-4">
                <label className="flex items-center">
                    <Input
                        type="radio"
                        name="priceFilter"
                        value="any"
                        checked={filterType === 'any'}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="mr-2"
                    />
                    Любая цена
                </label>

                <label className="flex items-center">
                    <Input
                        type="radio"
                        name="priceFilter"
                        value="less"
                        checked={filterType === 'less'}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="mr-2"
                    />
                    Меньше
                </label>

                <label className="flex items-center">
                    <Input
                        type="radio"
                        name="priceFilter"
                        value="greater"
                        checked={filterType === 'greater'}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="mr-2"
                    />
                    Больше
                </label>

                <label className="flex items-center">
                    <input
                        type="radio"
                        name="priceFilter"
                        value="range"
                        checked={filterType === 'range'}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="mr-2"
                    />
                    Диапазон
                </label>
            </div>

            {/* Поля ввода в зависимости от типа фильтра */}
            {filterType === 'less' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Максимальная цена</label>
                    <Input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Например: 1000"
                        variant="default"
                        size="medium"
                    />
                </div>
            )}

            {filterType === 'greater' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Минимальная цена</label>
                    <Input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Например: 500"
                        variant="default"
                        size="medium"
                    />
                </div>
            )}

            {filterType === 'range' && (
                <div className="mb-4 space-y-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">От</label>
                        <Input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="Минимальная цена"
                            variant="default"
                            size="medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">До</label>
                        <Input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="Максимальная цена"
                            variant="default"
                            size="medium"
                        />
                    </div>
                </div>
            )}

            {/* Кнопки действий */}
            <div className="flex space-x-2">
                <Button
                    onClick={handleApplyFilter}
                    disabled={isApplyDisabled}
                    variant="primary"
                    size="medium"
                    className="flex-1"
                >
                    Применить
                </Button>

                <Button
                    onClick={handleClearFilter}
                    variant="outline"
                    size="medium"
                    className="flex-1"
                >
                    Сбросить
                </Button>
            </div>

            {/* Отображение активного фильтра */}
            {currentPriceFilter.type !== 'any' && (
                <div className="mt-3 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                        Активный фильтр: {getFilterDescription(currentPriceFilter)}
                    </p>
                </div>
            )}
        </div>
    );
};

// Вспомогательная функция для описания фильтра
const getFilterDescription = (filter) => {
    switch (filter.type) {
        case 'less':
            return `до ${filter.max} ₽`;
        case 'greater':
            return `от ${filter.min} ₽`;
        case 'range':
            return `от ${filter.min} до ${filter.max} ₽`;
        default:
            return 'любая цена'; j
    }

}

export default PriceFilter;