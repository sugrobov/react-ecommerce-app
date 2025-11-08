import React from 'react';
import ProductList from '../../containers/ProductList';

const Content = ({ categoryId, searchQuery }) => {
    return (
        <main className="lg:flex-1">
            <ProductList
                categoryId={categoryId}
                searchQuery={searchQuery}
            />
        </main>
    )
}

export default Content;