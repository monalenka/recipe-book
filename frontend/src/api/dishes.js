import axiosInstance from './axiosInstance';

export const getDishes = (params) => axiosInstance.get('/dishes', { params });
export const getDishById = (id) => axiosInstance.get(`/dishes/${id}`);
export const createDish = (formData) => axiosInstance.post('/dishes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateDish = (id, formData) => axiosInstance.put(`/dishes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteDish = (id) => axiosInstance.delete(`/dishes/${id}`);