import { apiFetch, checkBackendHealth } from './client';
import {
  PassengerSearchResponse,
  PassengerTrainStatus,
  PassengerWhyStoppedResponse,
} from './types';
import { mockApi } from './mockApi';

/**
 * Service functions for Passenger Web Portal & Delay Diagnostics
 */

export async function searchTrains(query: string): Promise<PassengerSearchResponse> {
  const isOnline = await checkBackendHealth();
  if (isOnline && query.trim()) {
    try {
      return await apiFetch<PassengerSearchResponse>(`/api/v1/passenger/train/search?q=${encodeURIComponent(query)}`);
    } catch (err) {
      console.warn('Real passenger train search failed, using fallback:', err);
    }
  }
  return mockApi.searchPassengerTrains(query);
}

export async function getTrainStatus(trainId: string): Promise<PassengerTrainStatus> {
  const isOnline = await checkBackendHealth();
  if (isOnline && trainId) {
    try {
      return await apiFetch<PassengerTrainStatus>(`/api/v1/passenger/train/${encodeURIComponent(trainId)}/status`);
    } catch (err) {
      console.warn('Real passenger train status failed, using fallback:', err);
    }
  }
  return mockApi.getPassengerTrainStatus(trainId);
}

export async function getWhyStopped(trainId: string, authToken?: string): Promise<PassengerWhyStoppedResponse> {
  const isOnline = await checkBackendHealth();
  if (isOnline && trainId) {
    try {
      return await apiFetch<PassengerWhyStoppedResponse>(`/api/v1/passenger/train/${encodeURIComponent(trainId)}/why-stopped`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
    } catch (err) {
      console.warn('Real why-stopped explanation failed, using fallback:', err);
    }
  }
  return mockApi.getPassengerWhyStopped(trainId);
}
