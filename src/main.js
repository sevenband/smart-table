import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

// @todo: подключение
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

// Исходные данные используемые в render()
const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    // приведём количество страниц к числу
    const rowsPerPage = parseInt(state.rowsPerPage);
    // номер страницы по умолчанию 1 и тоже число
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page,
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    // здесь будут формироваться параметры запроса
    let query = {};
    // @todo: использование
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    // запрашиваем данные с собранными параметрами
    const { total, items } = await api.getRecords(query);

    // перерисовываем пагинатор
    updatePagination(total, query);

    sampleTable.render(items);
}

const sampleTable = initTable(
    {
        tableTemplate: "table",
        rowTemplate: "row",
        before: ["search", "header", "filter"],
        after: ["pagination"],
    },
    render,
);

// @todo: инициализация
const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements, // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => {
        // и колбэк, чтобы заполнять кнопки страниц данными
        const input = el.querySelector("input");
        const label = el.querySelector("span");
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    },
);
// Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal,
]);

// передаём элементы фильтра
const { applyFiltering, updateIndexes } = initFiltering(
    sampleTable.filter.elements,
);

//передаем сюда имя поискового поля search
const applySearching = initSearching(sampleTable.search.elements.search.name);

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

async function init() {
    const indexes = await api.getIndexes();
    updateIndexes(sampleTable.filter.elements, {
        // для элемента с именем searchBySeller устанавливаем массив продавцов
        searchBySeller: indexes.sellers,
    });
}

init().then(render);
