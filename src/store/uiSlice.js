import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        selectedCategory: null,
        searchQuery: ''
    },
    reducers: {
        setCategory: (state, action) => {
            state.selectedCategory = action.payload
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload

        }
    }
});

export const { setCategory, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;