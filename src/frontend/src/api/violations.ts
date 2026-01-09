import client from "./client";

export interface ViolationPayload {
  exam_id: number;
  student_id: number;
  reason: string;
  notes?: string;
  checkin_id?: number;
  evidence?: File;
}

export async function fetchViolations(examId?: number) {
  const isScoped = typeof examId === "number" && !Number.isNaN(examId);
  const url = isScoped
    ? `/api/proctor/exams/${examId}/violations`
    : "/api/admin/violations";
  const { data } = await client.get(url, {
    params: !isScoped && examId ? { exam_id: examId } : undefined,
  });
  return data.items;
}

export async function submitViolation(payload: ViolationPayload) {
  const form = buildFormData(payload);
  const { data } = await client.post("/api/proctor/violations", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateViolation(id: number, payload: Partial<ViolationPayload>) {
  const form = buildFormData(payload);
  const { data } = await client.put(`/api/proctor/violations/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteViolation(id: number) {
  await client.delete(`/api/proctor/violations/${id}`);
}

function buildFormData(payload: Partial<ViolationPayload>) {
  const form = new FormData();
  if (payload.exam_id !== undefined) form.append("exam_id", String(payload.exam_id));
  if (payload.student_id !== undefined) form.append("student_id", String(payload.student_id));
  if (payload.reason !== undefined) form.append("reason", payload.reason);
  if (payload.notes !== undefined) form.append("notes", payload.notes || "");
  if (payload.checkin_id !== undefined && payload.checkin_id !== null) {
    form.append("checkin_id", String(payload.checkin_id));
  } else if (payload.checkin_id === null) {
    form.append("checkin_id", "");
  }
  if (payload.evidence) form.append("evidence", payload.evidence);
  return form;
}
