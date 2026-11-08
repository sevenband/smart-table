export function initSearching(searchField) {
    return (query, state, action) => {
        // проверяем, что в поле поиска было что-то введено
        return state[searchField]
            ? Object.assign({}, query, {
                search: state[searchField], // устанавливаем в query параметр
            })
            : query; // если поле с поиском пустое, просто возвращаем query без изменений
    };
}
