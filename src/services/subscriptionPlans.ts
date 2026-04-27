import { apiService } from './api';

export interface SubscriptionPlan {
  _id?: string;
  id?: string;
  plan_id: string;
  plan_name: string;
  description?: string;
  price: number;
  currency?: string;
  duration_days: number;
  no_of_prompts?: number;
  features?: string[];
  is_active?: boolean;
  is_popular?: boolean;
  sort_order?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface SubscriptionPlansResponse {
  success?: boolean;
  message?: string;
  result?: {
    plans?: SubscriptionPlan[];
    plan?: SubscriptionPlan;
    total?: number;
  };
  plans?: SubscriptionPlan[];
  plan?: SubscriptionPlan;
  data?: SubscriptionPlan[];
}

export interface SubscriptionTransaction {
  _id?: string;
  id?: string;
  user_id?: any;
  plan_id?: any;
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface SubscriptionTransactionsResponse {
  success?: boolean;
  message?: string;
  result?: {
    transactions?: SubscriptionTransaction[];
    total?: number;
  };
  transactions?: SubscriptionTransaction[];
  data?: SubscriptionTransaction[];
}

function normalizeId<T extends { _id?: any; id?: any }>(item: T): T & { id: string; _id: string } {
  const raw = item._id ?? item.id ?? String(Math.random());
  const id = String(raw);
  return { ...(item as any), _id: id, id };
}

function extractPlans(response: SubscriptionPlansResponse | SubscriptionPlan[] | any): SubscriptionPlan[] {
  if (Array.isArray(response)) return response;
  if (response?.plans && Array.isArray(response.plans)) return response.plans;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (response?.success && response?.result?.plans && Array.isArray(response.result.plans)) return response.result.plans;
  if (response?.result && Array.isArray(response.result)) return response.result;
  return [];
}

function extractPlan(response: SubscriptionPlansResponse | any): SubscriptionPlan | null {
  if (response?.plan) return response.plan;
  if (response?.success && response?.result?.plan) return response.result.plan;
  if (response?.success && response?.result && typeof response.result === 'object' && !Array.isArray(response.result)) {
    // sometimes APIs return the entity as `result`
    return response.result as SubscriptionPlan;
  }
  return null;
}

function extractTransactions(response: SubscriptionTransactionsResponse | SubscriptionTransaction[] | any): SubscriptionTransaction[] {
  if (Array.isArray(response)) return response;
  if (response?.transactions && Array.isArray(response.transactions)) return response.transactions;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (response?.success && response?.result?.transactions && Array.isArray(response.result.transactions)) {
    return response.result.transactions;
  }
  if (response?.result && Array.isArray(response.result)) return response.result;
  return [];
}

class SubscriptionPlansService {
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiService.get<SubscriptionPlansResponse>('/api/admin/subscription-plans');
    return extractPlans(response).map((p) => normalizeId(p));
  }

  async getPlanById(planId: string): Promise<SubscriptionPlan> {
    const response = await apiService.get<SubscriptionPlansResponse>(`/api/admin/subscription-plans/${planId}`);
    const plan = extractPlan(response);
    if (!plan) throw { message: 'Plan not found' };
    return normalizeId(plan);
  }

  async createPlan(data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const payload: Partial<SubscriptionPlan> = {
      ...data,
      price: data.price != null ? Number(data.price) : undefined,
      duration_days: data.duration_days != null ? Number(data.duration_days) : undefined,
      sort_order: data.sort_order != null ? Number(data.sort_order) : undefined,
      no_of_prompts: data.no_of_prompts != null ? Number(data.no_of_prompts) : undefined,
    };
    const response = await apiService.post<SubscriptionPlansResponse>('/api/admin/subscription-plans', payload);
    const plan = extractPlan(response) ?? (extractPlans(response)[0] ?? null);
    if (!plan) throw { message: 'Invalid response format: plan not found' };
    return normalizeId(plan);
  }

  async updatePlan(planId: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const payload: Partial<SubscriptionPlan> = {
      ...data,
      price: data.price != null ? Number(data.price) : undefined,
      duration_days: data.duration_days != null ? Number(data.duration_days) : undefined,
      sort_order: data.sort_order != null ? Number(data.sort_order) : undefined,
      no_of_prompts: data.no_of_prompts != null ? Number(data.no_of_prompts) : undefined,
    };
    const response = await apiService.put<SubscriptionPlansResponse>(`/api/admin/subscription-plans/${planId}`, payload);
    const plan = extractPlan(response) ?? (extractPlans(response)[0] ?? null);
    if (!plan) throw { message: 'Invalid response format: plan not found' };
    return normalizeId(plan);
  }

  async deletePlan(planId: string): Promise<void> {
    await apiService.delete(`/api/admin/subscription-plans/${planId}`);
  }

  async getTransactions(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.limit != null) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);

    const tryEndpoints = [
      `/api/admin/subscription-transactions${qs.toString() ? `?${qs.toString()}` : ''}`,
      `/api/admin/subscription-plans/transactions${qs.toString() ? `?${qs.toString()}` : ''}`,
    ];

    let lastError: any = null;
    for (const endpoint of tryEndpoints) {
      try {
        const response = await apiService.get<SubscriptionTransactionsResponse>(endpoint);
        return extractTransactions(response).map((t) => normalizeId(t));
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError ?? { message: 'Failed to fetch transactions' };
  }
}

export const subscriptionPlansService = new SubscriptionPlansService();

