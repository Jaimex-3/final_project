import client from "./client";

export interface Student {
  id: number;
  student_number: string;
  full_name: string;
  email: string | null;
  created_at?: string;
}

export interface StudentPayload {
  student_no: string;
  full_name: string;
  email?: string;
}

export async function fetchStudents(search?: string) {
  const { data } = await client.get("/api/admin/students", { params: { search } });
  return data.items as Student[];
}

export async function createStudent(payload: StudentPayload) {
  const { data } = await client.post("/api/admin/students", payload);
  return data as Student;
}

export async function updateStudent(id: number, payload: StudentPayload) {
  const { data } = await client.put(`/api/admin/students/${id}`, payload);
  return data as Student;
}

export async function deleteStudent(id: number) {
  await client.delete(`/api/admin/students/${id}`);
}

export async function uploadStudentPhoto(id: number, file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  await client.post(`/api/admin/students/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
