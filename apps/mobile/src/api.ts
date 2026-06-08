import { API_URL } from "./config";

let authToken: string | null = null;
export function setAuthToken(t: string | null) {
  authToken = t;
}

async function req<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data as T;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  pricePaise: number;
  unitLabel: string;
  moq: number;
  stock: number;
  city: string | null;
  image: string | null;
  tags: string[];
  category: string;
  supplier: { id: string; name: string; city: string | null };
}

export interface ApiProductDetail extends ApiProduct {
  description: string | null;
  quantityMultiple: number;
  gstPercent: number;
  images: string[];
  priceSlabs: { minQty: number; maxQty: number | null; unitPricePaise: number }[];
}

export const api = {
  products: (params?: { q?: string; category?: string; sort?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.category) qs.set("category", params.category);
    if (params?.sort) qs.set("sort", params.sort);
    const s = qs.toString();
    return req<{ items: ApiProduct[]; total: number }>(`/api/products${s ? `?${s}` : ""}`);
  },
  product: (slug: string) => req<ApiProductDetail>(`/api/products/${slug}`),
  requestOtp: (phone: string) =>
    req<{ sent: boolean; devOtp?: string }>(`/api/auth/otp`, {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),
  login: (phone: string, otp: string) =>
    req<{ token: string; user: { id: string; name: string; role: string; phone: string } }>(
      `/api/auth/login`,
      { method: "POST", body: JSON.stringify({ phone, otp }) },
    ),
  cart: () =>
    req<{ items: { productId: string; name: string; supplier: string; quantity: number }[]; split: any }>(
      `/api/cart`,
    ),
  addToCart: (productId: string, quantity: number) =>
    req(`/api/cart`, { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  checkout: () => req<{ ok: boolean; order: any }>(`/api/checkout`, { method: "POST" }),
  orders: () => req<{ orders: any[] }>(`/api/orders`),
  chat: (message: string) =>
    req<{ text: string; products: ApiProduct[] }>(`/api/ai/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};
