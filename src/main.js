import "./fonts/ys-display/fonts.css";
import "./style.css";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

// @todo: подключение
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

// Исходные данные используемые в render()
const api = initData();

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    // приведём количество страниц к числу
    const rowsPerPage = parseInt(state.rowsPerPage, 10) || 10;
    const page = parseInt(state.page, 10) || 1;

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
    // Поиск и фильтрацию применяем до запроса, чтобы сервер вернул
    // только записи, соответствующие выбранным параметрам.
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    // Получаем записи с сервера по собранным параметрам запроса.
    const { total, items } = await api.getRecords(query);

    // Обновляем пагинатор по фактическому количеству записей на сервере.
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

// Инициализируем фильтрацию: параметры фильтра будут добавляться к query,
// а список продавцов заполним после получения справочников с сервера.
const { applyFiltering, updateIndexes } = initFiltering(
    sampleTable.filter.elements,
);

//передаем сюда имя поискового поля search
const applySearching = initSearching(sampleTable.search.elements.search.name);

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

async function init() {
    // Получаем справочники продавцов и покупателей с сервера.
    const indexes = await api.getIndexes();

    // Передаём компоненту фильтрации список продавцов для заполнения select.
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers,
    });
}

init().then(render);
