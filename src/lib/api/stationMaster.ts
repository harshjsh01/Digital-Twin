import { apiFetch, checkBackendHealth } from './client';
import {
  StationRadarResponse,
  StationRecommendationsResponse,
  ApproveActionPayload,
  ApproveActionResponse,
  OverrideActionPayload,
  OverrideActionResponse,
  EmergencyActionPayload,
  EmergencyActionResponse,
} from './types';
import { mockApi } from './mockApi';

/**
 * Service functions for Station Master & HITL Control Endpoints
 */

export async function getRadar(): Promise<StationRadarResponse> {
  const isOnline = await checkBackendHealth();
  if (isOnline) {
    try {
      return await apiFetch<StationRadarResponse>('/api/v1/station-master/radar');
    } catch (err) {
      console.warn('Real /api/v1/station-master/radar failed, using fallback:', err);
    }
  }
  return mockApi.getStationRadar();
}

export async function getRecommendations(): Promise<StationRecommendationsResponse> {
  const isOnline = await checkBackendHealth();
  if (isOnline) {
    try {
      return await apiFetch<StationRecommendationsResponse>('/api/v1/station-master/recommendations');
    } catch (err) {
      console.warn('Real /api/v1/station-master/recommendations failed, using fallback:', err);
    }
  }
  return mockApi.getStationRecommendations();
}

export async function approveRecommendation(payload: ApproveActionPayload): Promise<ApproveActionResponse> {
  const isOnline = await checkBackendHealth();
  if (isOnline) {
    try {
      return await apiFetch<ApproveActionResponse>('/api/v1/station-master/action/approve', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Real approval API failed, applying locally:', err);
    }
  }
  return mockApi.approveRecommendation(payload);
}

export async function overrideRecommendation(payload: OverrideActionPayload): Promise<OverrideActionResponse> {
  const isOnline = await checkBackendHealth();
  if (isOnline) {
    try {
      return await apiFetch<OverrideActionResponse>('/api/v1/station-master/action/override', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Real override API failed, applying locally:', err);
    }
  }
  return mockApi.overrideRecommendation(payload);
}

export async function triggerEmergencyStop(payload: EmergencyActionPayload = {}): Promise<EmergencyActionResponse> {
  const isOnline = await checkBackendHealth();
  if (isOnline) {
    try {
      return await apiFetch<EmergencyActionResponse>('/api/v1/station-master/action/emergency-all-red', {
        method: 'POST',
        body: JSON.stringify({
          zone_id: payload.zone_id || 'DADRI_CENTRAL',
          reason: payload.reason || 'MANUAL_EMERGENCY_TRIGGER',
          dispatcher_id: payload.dispatcher_id || 'SM_OFFICER_01',
        }),
      });
    } catch (err) {
      console.warn('Emergency stop API failed, applying locally:', err);
    }
  }
  return mockApi.triggerEmergencyStop(payload);
}
