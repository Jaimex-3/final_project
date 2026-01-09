import client from "./client";

export interface Exam {
  id: number;
  code: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  room?: {
    id: number;
    name: string;
  };
  room_id?: number;
}

export interface ExamPayload {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  room_id: number;
}

export async function fetchExams() {
  const { data } = await client.get("/api/admin/exams");
  return data.items as Exam[];
}

export async function fetchExam(id: string | number) {
  const { data } = await client.get(`/api/admin/exams/${id}`);
  return data;
}

export async function createExam(payload: ExamPayload) {
  const { data } = await client.post("/api/admin/exams", payload);
  return data;
}

export async function updateExam(id: number, payload: Partial<ExamPayload>) {
  const { data } = await client.put(`/api/admin/exams/${id}`, payload);
  return data;
}

export async function deleteExam(id: number) {
  await client.delete(`/api/admin/exams/${id}`);
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  location?: string;
}

export interface RoomPayload {
  name: string;
  capacity: number;
  location?: string;
}

export async function fetchRooms() {
  const { data } = await client.get("/api/admin/rooms");
  return data.items as Room[];
}

export async function fetchRoster(examId: number) {
  const { data } = await client.get(`/api/admin/exams/${examId}/roster`);
  return data.items as { student_id: number; student: { full_name: string; student_number: string } }[];
}

export async function addStudentToRoster(examId: number, studentId: number) {
  await client.post(`/api/admin/exams/${examId}/roster`, { student_id: studentId });
}

export async function removeStudentFromRoster(examId: number, studentId: number) {
  await client.delete(`/api/admin/exams/${examId}/roster/${studentId}`);
}

export async function createRoom(payload: RoomPayload) {
  const { data } = await client.post("/api/admin/rooms", payload);
  return data as Room;
}

export async function updateRoom(id: number, payload: Partial<RoomPayload>) {
  const { data } = await client.put(`/api/admin/rooms/${id}`, payload);
  return data as Room;
}

export async function deleteRoom(id: number) {
  await client.delete(`/api/admin/rooms/${id}`);
}
