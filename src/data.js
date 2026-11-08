import { makeIndex } from "./lib/utils.js";

export function initData(sourceData) {
    let sellers;
    let customers;

    // Функция для приведения строк в нужный вид
    const mapRecords = (data) =>
        data.map((item) => ({
            id: item.receipt_id,
            date: item.date,
            seller: sellers[item.seller_id],
            customer: customers[item.customer_id],
            total: item.total_amount,
        }));

    // Получаем индексы (словари) для продавцов и покупателей из локальных данных
    const getIndexes = async () => {
        if (!sellers || !customers) {
            sellers = makeIndex(
                sourceData.sellers,
                "id",
                (s) => `${s.first_name} ${s.last_name}`
            );
            customers = makeIndex(
                sourceData.customers,
                "id",
                (c) => `${c.first_name} ${c.last_name}`
            );
        }
        return { sellers, customers };
    };

    // Имитация работы сервера на основе локального датасета
    const getRecords = async (query) => {
        // Берем копию массива записей
        let records = [...sourceData.purchase_records];

        // 1. Поиск (общий)
        if (query.search) {
            const s = query.search.toLowerCase();
            records = records.filter((r) => {
                const date = r.date.toLowerCase();
                const seller = (sellers[r.seller_id] || "").toLowerCase();
                const customer = (customers[r.customer_id] || "").toLowerCase();
                const total = r.total_amount.toString();
                return (
                    date.includes(s) ||
                    seller.includes(s) ||
                    customer.includes(s) ||
                    total.includes(s)
                );
            });
        }

        // 2. Фильтрация по колонкам
        if (query["filter[date]"]) {
            const f = query["filter[date]"].toLowerCase();
            records = records.filter((r) => r.date.toLowerCase().includes(f));
        }
        if (query["filter[customer]"]) {
            const f = query["filter[customer]"].toLowerCase();
            records = records.filter((r) =>
                (customers[r.customer_id] || "").toLowerCase().includes(f)
            );
        }
        if (query["filter[seller]"]) {
            records = records.filter(
                (r) => sellers[r.seller_id] === query["filter[seller]"]
            );
        }
        if (query["filter[totalFrom]"]) {
            const from = parseFloat(query["filter[totalFrom]"]);
            if (!isNaN(from)) {
                records = records.filter((r) => r.total_amount >= from);
            }
        }
        if (query["filter[totalTo]"]) {
            const to = parseFloat(query["filter[totalTo]"]);
            if (!isNaN(to)) {
                records = records.filter((r) => r.total_amount <= to);
            }
        }

        // 3. Сортировка
        if (query.sort) {
            const [field, order] = query.sort.split(":");
            records.sort((a, b) => {
                let valA, valB;
                if (field === "date") {
                    valA = a.date;
                    valB = b.date;
                } else if (field === "total") {
                    valA = a.total_amount;
                    valB = b.total_amount;
                }

                if (valA < valB) return order === "up" ? -1 : 1;
                if (valA > valB) return order === "up" ? 1 : -1;
                return 0;
            });
        }

        const total = records.length;

        // 4. Пагинация
        const limit = parseInt(query.limit) || 10;
        const page = parseInt(query.page) || 1;
        const startIndex = (page - 1) * limit;
        const paginatedRecords = records.slice(startIndex, startIndex + limit);

        return {
            total,
            items: mapRecords(paginatedRecords),
        };
    };

    return {
        getIndexes,
        getRecords,
    };
}