import React, { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        onSearch(debouncedQuery)

    }, [debouncedQuery, onSearch]);

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Поиск товаров..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />      {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            )}

        </div>
    );

}

export default SearchBar;