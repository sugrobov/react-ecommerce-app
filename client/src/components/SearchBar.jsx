import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";
import Input from "./Ui/Input";
import Button from "./Ui/Button";

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);

    // Стабильная ссылка на функцию очистки
    const handleClear = useCallback(() => {
        setQuery('');
        onSearch('');
    }, [onSearch]);

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    useEffect(() => {
        onSearch(debouncedQuery)

    }, [debouncedQuery, onSearch]);

    return (
        <div className="relative">
            <Input
                type="text"
                placeholder="Поиск товаров..."
                value={query}
                onChange={handleChange}
                size="medium"
                className="w-64 pr-10" // отступ для иконки
                icon={
                    query && (
                        <Button
                            variant="outline"
                            size="small"
                            onClick={handleClear}
                            className="!p-1 !min-w-0 h-6 w-6 rounded-full"
                        >
                            ✕
                        </Button>
                    )
                }
            />
        </div>
    );

}

export default SearchBar;