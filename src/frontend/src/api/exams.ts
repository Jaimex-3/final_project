import client from "./client";

export async function fetchExams() {
  const { data } = await client.get("/api/proctor/exams");
  return data.items;
}

export async function fetchExam(id: string | number) {
  const { data } = await client.get(`/api/proctor/exams/${id}`);
  return data;
}
