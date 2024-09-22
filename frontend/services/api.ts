import axios from 'axios';
import { getAccessToken } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: fix type
export async function createCompany(companyData: any) {
    const response = await apiClient.post('/company', companyData, {
        headers: {
            Authorization: `Bearer ${getAccessToken()}`,
        },
    });
    return response.data;
}

export async function getCompany(handle: string) {
  const response = await apiClient.get(`/company?handle=${handle}`);
  return response.data;
}

export async function getCompanies() {
  const response = await apiClient.get('/companies');
  return response.data;
}

export async function getProfile() {
  const response = await apiClient.get('/profile', {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
}

export async function getUserCompanies() {
  const response = await apiClient.get('/user-companies', {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
}

export async function getCompanyPeople(handle: string) {
  const response = await apiClient.get(`/company-people?handle=${handle}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
}
