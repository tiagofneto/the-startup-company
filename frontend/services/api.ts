import axios from 'axios';
import { getAccessToken } from '@/lib/utils';
import { OpenPassport1StepInputs } from '@openpassport/sdk';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// TODO: fix type
export async function createCompany(companyData: any) {
  const response = await apiClient.post('/company', companyData, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
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
      Authorization: `Bearer ${getAccessToken()}`
    }
  });
  return response.data;
}

export async function getUserCompanies() {
  const response = await apiClient.get('/user-companies', {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });
  return response.data;
}

export async function getCompanyPeople(handle: string) {
  const response = await apiClient.get(`/company-people?handle=${handle}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });
  return response.data;
}

export async function verifyKyc(proof: OpenPassport1StepInputs) {
  const response = await apiClient.post(
    '/verify-kyc',
    { proof: proof },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );
  return response.data;
}

export async function createCompanyUser(email: string, company_id: number) {
  const response = await apiClient.post(
    '/company-user',
    { email, company_id },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );
  return response.data;
}

export async function createStream(
  user_id: string,
  handle: string,
  rate: number
) {
  const response = await apiClient.post(
    '/stream',
    { user_id, handle, rate },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );
  return response.data;
}

export async function getUserStreams(user_id: string) {
  const response = await apiClient.get(`/user-streams?user_id=${user_id}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });
  return response.data;
}

export async function getUserCompanyStreams(handle: string, user_id: string) {
  const response = await apiClient.get(
    `/user-company-streams?handle=${handle}&user_id=${user_id}`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );
  return response.data;
}
