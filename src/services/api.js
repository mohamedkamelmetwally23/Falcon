const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("voltio-token");
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body) headers["Content-Type"] = "application/json";
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data =
    response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "تعذر الاتصال بالخادم");
  return data;
}

export const authApi = {
  login: (data) =>
    api("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) =>
    api("/auth/register", { method: "POST", body: JSON.stringify(data) }),
};
export const orderApi = {
  list: () => api("/orders"),
  create: (data) =>
    api("/orders", { method: "POST", body: JSON.stringify(data) }),
  status: (id, status) =>
    api(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  confirm: (id, data = {}) =>
    api(`/orders/${id}/confirm`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  reject: (id) => api(`/orders/${id}/reject`, { method: "POST" }),
};
export const returnApi = {
  list: () => api("/returns"),
  create: (data) =>
    api("/returns", { method: "POST", body: JSON.stringify(data) }),
};
export const customerApi = {
  list: () => api("/customers"),
  create: (data) =>
    api("/customers", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    api(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  addPayment: (id, data) =>
    api(`/customers/${id}/payments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
