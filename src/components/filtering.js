export function initFiltering(elements) {
    // заполняем выпадающие списки опциями

    const updateIndexes = (elements, indexes) => {
        // Получаем ключи из объекта
        Object.keys(indexes)
            // Перебираем по именам
            .forEach((elementName) => {
                // в каждый элемент добавляем опции
                elements[elementName].append(
                    // формируем массив имён, значений опций
                    ...Object.values(indexes[elementName])
                        // используем name как значение и текстовое содержимое
                        .map((name) => {
                            // создадим и вернем тег опции <option value="name">name</option>
                            const optionElement =
                                document.createElement("option");
                            optionElement.value = name;
                            optionElement.textContent = name;
                            return optionElement;
                        }),
                );
            });
    };

    const applyFiltering = (query, state, action) => {
        // обработаем очистку поля

        // проверяем наличие действия и имя кнопки 'clear'
        if (action && action.name === "clear") {
            //находим input рядом с нашей кнопкой через родительский элемент кнопки
            const clearButtonContainer = action.parentElement;
            const input = clearButtonContainer.querySelector("input");
            // Для найденного поля ввода сбрасываем value
            input.value = "";
            //для соответствующего поля в state также сбрасываем значение
            const searchField = action.dataset.field;
            state[searchField] = "";
        }
        // Сформируем параметры фильтрации для серверного запроса.
        const filter = {};
        Object.keys(elements).forEach((key) => {
            if (elements[key]) {
                if (
                    ["INPUT", "SELECT"].includes(elements[key].tagName) &&
                    elements[key].value
                ) {
                    // ищем поля ввода в фильтре с непустыми данными
                    filter[`filter[${elements[key].name}]`] =
                        elements[key].value; // чтобы сформировать в query вложенный объект фильтра
                }
            }
        });

        return Object.keys(filter).length
            ? Object.assign({}, query, filter)
            : query; // если в фильтре что-то добавилось, применим к запросу
    };

    return {
        updateIndexes,
        applyFiltering,
    };
}
