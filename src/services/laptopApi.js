const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/laptops`;

async function request(path = "", options = {}) {
  const { timeoutMs = 15000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${localStorage.getItem("voltio-token") || ""}`,
    };
    if (
      fetchOptions.body &&
      !(fetchOptions.body instanceof FormData) &&
      !headers["Content-Type"]
    )
      headers["Content-Type"] = "application/json";
    const response = await fetch(`${API_URL}${path}`, {
      headers,
      ...fetchOptions,
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "تعذر الاتصال بالخادم");
    }
    return response.status === 204 ? null : response.json();
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error("انتهت مهلة الاتصال بالخادم. حاول مرة أخرى.");
    if (error instanceof TypeError)
      throw new Error(
        "تعذر الوصول إلى الخادم. تحقق من اتصال الشبكة وإعدادات CORS.",
      );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function formBody(laptop) {
  const body = new FormData();
  Object.entries(laptop).forEach(([key, value]) => {
    if (key === "imageFile" || key === "id" || key === "_id") return;
    if (key === "image" && laptop.imageFile) return;
    if (value !== undefined && value !== null) body.append(key, value);
  });
  if (laptop.imageFile) body.append("image", laptop.imageFile);
  return body;
}

export const laptopApi = {
  list: () => request(),
  create: (laptop) =>
    request("", {
      method: "POST",
      body: formBody(laptop),
      timeoutMs: 45000,
    }),
  update: (id, laptop) =>
    request(`/${id}`, {
      method: "PUT",
      body: formBody(laptop),
      timeoutMs: 45000,
    }),
  remove: (id) => request(`/${id}`, { method: "DELETE" }),
  import: (laptops) =>
    request("/import", {
      method: "POST",
      body: JSON.stringify({ laptops }),
      timeoutMs: 60000,
    }),
};
