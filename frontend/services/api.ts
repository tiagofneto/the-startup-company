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
    const response = await apiClient.post('/company', companyData);
    return response.data;
}

export async function getCompanies() {
  const response = await apiClient.get('/companies');
  return response.data;
}