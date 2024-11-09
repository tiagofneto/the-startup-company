import axios from 'axios';
import { getAccessToken } from '@/lib/utils';
import { OpenPassportAttestation } from '@openpassport/core';

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

export async function verifyKyc(proof: OpenPassportAttestation) {
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

export async function createCompanyUser(email: string, handle: number) {
  const response = await apiClient.post(
    '/company-user',
    { email, handle },
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

export async function getCompanyBalance(handle: string) {
  const response = await apiClient.get(`/company-balance?handle=${handle}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });
  return response.data;
}

export async function fundCompany(handle: string, amount: number) {
  const response = await apiClient.post(
    '/fund-company',
    { handle, amount },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );
  return response.data;
}

export async function getShareholders(handle: string) {
  const response = await apiClient.get(`/shareholders?handle=${handle}`);
  return response.data;
}

export async function getShares(handle: string) {
  const response = await apiClient.get(`/shares?handle=${handle}`);
  return response.data;
}

export async function issueShares(handle: string, shares: number, splits: any) {
  const response = await apiClient.post(
    '/issue-shares',
    { handle, shares, splits },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );
  return response.data;
}

export async function transferTokens(
  from: string,
  to: string,
  amount: number,
  isAddress: boolean
) {
  const response = await apiClient.post(
    '/transfer-tokens',
    { from, to, amount, isAddress },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );
  return response.data;
}

export async function getKycStatus() {
  const response = await apiClient.get('/kyc-status', {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });
  return response.data;
}

export async function isFaceValid(img: string) {
  const response = await apiClient.post('/is-face-valid', { img }, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`
    }
  });
  return response.data;
}