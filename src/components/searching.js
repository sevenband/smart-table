export function initSearching(searchField) {
    return (query, state, action) => {
        // проверяем, что в поле поиска было что-то введено
        return state[searchField]
            ? Object.assign({}, query, {
                search: state[searchField],
            })
            : query;
    };
}