import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: fix type
export async function createCompany(companyData: any) {
    const response = await apiClient.post('/create-company', companyData);
    return response.data;
}