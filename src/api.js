const BASE_URL = "https://jsonplaceholder.typicode.com";

// Küçük bir fetch yardımcıları:
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API hata: ${res.status} ${text}`);
  }
  // DELETE boş döner; onu da idare edelim
  try { return await res.json(); } catch { return null; }
}

export const api = {
  getPosts: () => request("/posts?_limit=5"),
  createPost: (data) =>
    request("/posts", { method: "POST", body: JSON.stringify({ ...data, userId: 1 }) }),
  updatePost: (id, data) =>
    request(`/posts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePost: (id) => request(`/posts/${id}`, { method: "DELETE" }),
};