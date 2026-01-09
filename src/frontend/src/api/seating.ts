import client from "./client";

export type Seat = {
  id?: number;
  seat_code: string;
  row_number?: number;
  col_number?: number;
};

export async function fetchSeatingPlan(examId: number) {
  const { data } = await client.get(`/api/admin/exams/${examId}/seating-plan`);
  return data;
}

export async function createSeatingPlan(
  examId: number,
  payload: { rows?: number; cols?: number; seat_codes?: string[]; name?: string }
) {
  const { data } = await client.post(
    `/api/admin/exams/${examId}/seating-plan`,
    payload
  );
  return data;
}

export async function fetchSeatAssignments(examId: number) {
  const { data } = await client.get(
    `/api/admin/exams/${examId}/seat-assignments`
  );
  return data.items;
}

export async function assignSeats(
  examId: number,
  assignments: { student_id: number; seat_code: string }[]
) {
  const { data } = await client.post(
    `/api/admin/exams/${examId}/seat-assignments`,
    { assignments }
  );
  return data.items;
}

export async function fetchRoster(examId: number) {
  const { data } = await client.get(`/api/admin/exams/${examId}/roster`);
  return data.items;
}
