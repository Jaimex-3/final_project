import client from "./client";

export async function fetchUsers() {
  const { data } = await client.get("/api/admin/users");
  return data.items;
}
