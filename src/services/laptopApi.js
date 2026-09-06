const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/laptops`;

async function request(path = "", options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${localStorage.getItem("voltio-token") || ""}`,
    };
    if (options.body && !headers["Content-Type"])
      headers["Content-Type"] = "application/json";
    const response = await fetch(`${API_URL}${path}`, {
      headers,
      ...options,
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

export const laptopApi = {
  list: () => request(),
  create: (laptop) =>
    request("", { method: "POST", body: JSON.stringify(laptop) }),
  update: (id, laptop) =>
    request(`/${id}`, { method: "PUT", body: JSON.stringify(laptop) }),
  remove: (id) => request(`/${id}`, { method: "DELETE" }),
  import: (laptops) =>
    request("/import", { method: "POST", body: JSON.stringify({ laptops }) }),
};
