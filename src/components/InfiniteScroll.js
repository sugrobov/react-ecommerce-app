import React, { useEffect, useRef } from 'react';

function InfiniteScroll({ onLoadMore, hasMore, loading }) {
    const observerRef = useRef();
    const elementRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore && !loading) {
                        onLoadMore()
                    }
                },
                { threshold: 0.1 }
        );
        if (elementRef.current) {
            observer.observe(elementRef.current)
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current)
            }
        }

    }, [hasMore, loading, onLoadMore]);

    return (
        <div ref={elementRef} className='py-4 text-center'>
            {loading && <div className='animate-pulse'>Загрузка...</div>}
        </div>
    )
    
}

export default InfiniteScroll;
