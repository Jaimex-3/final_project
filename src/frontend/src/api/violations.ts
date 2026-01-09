import client from "./client";

export async function fetchViolations(examId?: number) {
  const url = examId
    ? `/api/proctor/exams/${examId}/violations`
    : "/api/admin/violations";
  const { data } = await client.get(url, {
    params: examId ? undefined : { exam_id: examId },
  });
  return data.items;
}

export async function submitViolation(payload: {
  exam_id: number;
  student_id: number;
  reason: string;
  notes?: string;
  checkin_id?: number;
  evidence?: File;
}) {
  const form = new FormData();
  form.append("exam_id", String(payload.exam_id));
  form.append("student_id", String(payload.student_id));
  form.append("reason", payload.reason);
  if (payload.notes) form.append("notes", payload.notes);
  if (payload.checkin_id) form.append("checkin_id", String(payload.checkin_id));
  if (payload.evidence) form.append("evidence", payload.evidence);

  const { data } = await client.post("/api/proctor/violations", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
