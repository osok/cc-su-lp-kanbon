/**
 * API client module for communicating with the backend.
 * Requirements: Uses types from @kanban/types
 */
import type {
  ApiResponse,
  TasksResponseData,
  Sequence,
  SystemStatus,
  AppConfig,
} from '@kanban/types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

/** Fetch all tasks and recent changes */
export async function fetchTasks(): Promise<ApiResponse<TasksResponseData>> {
  return fetchJson<ApiResponse<TasksResponseData>>('/tasks');
}

/** Fetch all sequence metadata */
export async function fetchSequences(): Promise<ApiResponse<Sequence[]>> {
  return fetchJson<ApiResponse<Sequence[]>>('/sequences');
}

/** Fetch system status */
export async function fetchStatus(): Promise<ApiResponse<SystemStatus>> {
  return fetchJson<ApiResponse<SystemStatus>>('/status');
}

/** Fetch current configuration */
export async function fetchConfig(): Promise<ApiResponse<AppConfig>> {
  return fetchJson<ApiResponse<AppConfig>>('/config');
}

/** Set or change the watched directory */
export async function setDirectory(directory: string): Promise<ApiResponse<AppConfig>> {
  return fetchJson<ApiResponse<AppConfig>>('/config/directory', {
    method: 'POST',
    body: JSON.stringify({ directory }),
  });
}
