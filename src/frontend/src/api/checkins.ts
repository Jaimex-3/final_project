import client from "./client";

export async function fetchCheckins(examId: number) {
  const { data } = await client.get(`/api/proctor/exams/${examId}/checkins`);
  return data.items;
}

export async function submitCheckin(payload: {
  exam_id: number;
  student_id: number;
  entered_seat_code: string;
  photo: File;
}) {
  const form = new FormData();
  form.append("exam_id", String(payload.exam_id));
  form.append("student_id", String(payload.student_id));
  form.append("entered_seat_code", payload.entered_seat_code);
  form.append("photo", payload.photo);

  const { data } = await client.post("/api/proctor/checkins", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
