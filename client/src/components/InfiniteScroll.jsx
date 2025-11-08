import React, { useEffect, useRef } from 'react';

function InfiniteScroll({ onLoadMore, hasMore, loading }) {

        if (!hasMore) return null;

    return (
        <div className='py-4 text-center'>
             {loading ? (
                <div className='animate-pulse'>Загрузка...</div>
            ) : (
                <button
                    onClick={onLoadMore}
                    className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors'
                >
                    Загрузить еще
                </button>
            )}
        </div>
    )
    
}

export default InfiniteScroll;
