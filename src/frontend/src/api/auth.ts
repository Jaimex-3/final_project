import client from "./client";

export async function login(email: string, password: string) {
  const { data } = await client.post("/api/auth/login", { email, password });
  return data;
}

export async function getMe(token: string) {
  const { data } = await client.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
