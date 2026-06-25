import api from "./api";

export const shopService = {
  // Step 1: Products
  createShop: async (sub:string,name:string) => {
    const response = await api.post(`/shops`, {sub,name});
    return response;
  },
}