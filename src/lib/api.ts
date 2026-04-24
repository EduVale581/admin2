export const api = {
  get: async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return { error: `Error ${res.status}: ${res.statusText}` };
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error("API GET Error:", error);
      return { error: "Error de conexión" };
    }
  },

  post: async (url: string, body: unknown) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return { error: `Error ${res.status}: ${res.statusText}` };
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error("API POST Error:", error);
      return { error: "Error de conexión" };
    }
  },
};
