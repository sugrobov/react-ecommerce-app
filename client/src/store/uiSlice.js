import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        selectedCategory: null,
        searchQuery: '',
        priceFilter: {
            type: 'any', // 'any', 'less', 'greater', 'range'
            min: null,
            max: null
        }
    },
    reducers: {
        setCategory: (state, action) => {
            state.selectedCategory = action.payload
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload

        },
        setPriceFilter: (state, action) => {
            state.priceFilter = action.payload;
        },
        clearPriceFilter: (state) => {
            state.priceFilter = {
                type: 'any',
                min: null,
                max: null
            };
        }
    },
});

export const { setCategory, setSearchQuery, setPriceFilter, clearPriceFilter } = uiSlice.actions;
export default uiSlice.reducer;