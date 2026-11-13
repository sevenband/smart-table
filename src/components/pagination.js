import { getPages } from "../lib/utils.js";

export const initPagination = (
    { pages, fromRow, toRow, totalRows },
    createPage,
) => {
    // подготовим шаблон кнопки для страницы и очистить контейнер
 
    // в качестве шаблона берём первый элемент из контейнера со страницами
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    // и удаляем его (предполагаем, что там больше ничего, как вариант, можно и всё удалить из pages)
    pages.firstElementChild.remove();

    // переменная для хранения количества страниц, которое отображали при последней отрисовке (это нужно, чтобы выполнить действие last — последняя страница)
    let pageCount;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // обработаем действия
        if (action)
            switch (action.name) {
                // переход на предыдущую страницу
                case "prev":
                    page = Math.max(1, page - 1);
                    break;
                // переход на следующую страницу
                case "next":
                    page = Math.min(pageCount, page + 1);
                    break;
                // переход на первую страницу
                case "first":
                    page = 1;
                    break;
                // переход на последнюю страницу
                case "last":
                    page = pageCount;
                    break;
            }

        return Object.assign({}, query, {
            // добавим параметры к query, но не изменяем исходный объект
            limit,
            page,
        });
    };

    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);
        // получим список видимых страниц и выведим их

        // Получим массив страниц, которые нужно показать, выводим только 5 страниц
        const visiblePages = getPages(page, pageCount, 5);
        // перебираем их и создаём для них кнопку
        pages.replaceChildren(
            ...visiblePages.map((pageNumber) => {
                // клонируем шаблон, который запомнили ранее
                const el = pageTemplate.cloneNode(true);
                // вызываем колбэк из настроек, чтобы заполнить кнопку данными
                return createPage(el, pageNumber, pageNumber === page);
            }),
        );
        // обновим статус пагинации

        // С какой строки выводим
        fromRow.textContent = (page - 1) * limit + 1;
        // До какой строки выводим, если это последняя страница, то отображаем оставшееся количество
        toRow.textContent = Math.min(page * limit, total);
        // Сколько всего строк выводим на всех страницах вместе (после фильтрации будет меньше)
        totalRows.textContent = total;
    };

    return {
        updatePagination,
        applyPagination,
    };
};
