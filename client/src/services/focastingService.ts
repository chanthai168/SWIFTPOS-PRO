import api from "./api"
export const forcastingService = {
    getLowStockItem : async() => {
        const response = await api.get('/forcasting/low-stock-items');
        return response.data;
    },

    getProductRanking : async() => {
        const response = await api.get('/forcasting/items-ranking');
        return response.data;
    },
    getSaleAnalytic : async() => {
        const response = await api.get('/forcasting/sale-analytic');
        return response.data;
    },
}