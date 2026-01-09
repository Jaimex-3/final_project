import client from "./client";

export async function login(email: string, password: string) {
  const { data } = await client.post("/api/auth/login", { email, password });
  return data;
}

export async function getMe() {
  const { data } = await client.get("/api/auth/me");
  return data;
}
