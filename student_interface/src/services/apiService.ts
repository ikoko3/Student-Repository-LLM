import apiClient from '@/services/axiosInstance';

export interface Item {
  id: number;
  name: string;
}

export default {
  async fetchData(endpoint: string): Promise<Item[]> {
    try {
      const response = await apiClient.get<Item[]>(`/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  async postData(endpoint: string, payload: Item): Promise<Item> {
    try {
      const response = await apiClient.post<Item>(`/${endpoint}`, payload);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
};
