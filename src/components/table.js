import { cloneTemplate } from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const { tableTemplate, rowTemplate, before, after } = settings;
    const root = cloneTemplate(tableTemplate);

    // выведем дополнительные шаблоны до и после таблицы

    // перебираем массив идентификаторов шаблонов before
    before.reverse().forEach((templateId) => {
        // клонируем и получаем объект, сохраняем в таблице
        root[templateId] = cloneTemplate(templateId);
        // добавляем к таблице до (prepend)
        root.container.prepend(root[templateId].container);
    });

    // перебираем нужный массив идентификаторов шаблонов after
    after.forEach((templateId) => {
        // клонируем и получаем объект, сохраняем в таблице
        root[templateId] = cloneTemplate(templateId);
        // добавляем к таблице после (append)
        root.container.append(root[templateId].container);
    });

    // обработаем события и вызвем onAction()
    root.container.addEventListener("change", () => {
        onAction();
    });
    root.container.addEventListener("reset", () => setTimeout(onAction, 0));
    root.container.addEventListener("submit", (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        // преобразуем данные в массив строк на основе шаблона rowTemplate
        const nextRows = data.map((item) => {
            const row = cloneTemplate(rowTemplate);
            Object.keys(item).forEach((key) => {
                if (row.elements[key]) {
                    row.elements[key].textContent = item[key];
                }
            });
            return row.container;
        });
        root.elements.rows.replaceChildren(...nextRows);
    };

    return { ...root, render };
}
