import api from "./api"
export const statsService = {

    getDashboardStats : async(shopId:number) => {
        const response = await api.get(`/stats/${shopId}/dashboard`);
        return response.data;
    },
}