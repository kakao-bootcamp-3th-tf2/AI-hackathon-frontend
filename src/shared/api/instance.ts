/**
 * HTTP Client Instance
 * Singleton instance of axios HTTP client for API requests
 */

import httpClient from "@/lib/api/httpClient";

/**
 * Export the singleton httpClient instance
 * Ready to use with all HTTP methods: get, post, put, patch, delete
 */
export const apiInstance = httpClient;

export type { AxiosRequestConfig, AxiosResponse } from "axios";
