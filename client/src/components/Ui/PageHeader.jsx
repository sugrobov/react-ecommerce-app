import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

const PageHeader = ({
    currentPage,
    showBackButton = true,
    showHomeButton = true,
    className = ''
}) => {
    const navigate = useNavigate();

    return (
        <div className={`mb-8 ${className}`}>
            {/* Хлебные крошки */}
            <nav className="mb-6 text-sm text-gray-600">
                <ol className="flex items-center space-x-2">
                    <li>
                        <button
                            onClick={() => navigate('/')}
                            className="hover:text-blue-600 hover:underline transition-colors"
                        >
                            Главная
                        </button>
                    </li>
                    <li className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </li>
                    <li className="font-medium text-gray-800">{currentPage}</li>
                </ol>
            </nav>

            {/* Кнопки навигации */}
            <div className="flex flex-wrap items-center gap-4">
                {showBackButton && (
                    <Button
                        variant="outline"
                        size="small"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 hover:shadow-sm transition-shadow"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Назад
                    </Button>
                )}

                {showHomeButton && (
                    <Button
                        variant="outline"
                        size="small"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 hover:shadow-sm transition-shadow"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        На главную
                    </Button>
                )}
            </div>
        </div>
    );
}

export default PageHeader;