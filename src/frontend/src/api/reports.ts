import client from "./client";

export async function fetchSummary(examId?: number) {
  const { data } = await client.get("/api/admin/reports/summary", {
    params: { exam_id: examId },
  });
  return data;
}

export async function fetchReportCheckins(params: {
  exam_id?: number;
  face_match?: boolean;
  seat_ok?: boolean;
}) {
  const { data } = await client.get("/api/admin/reports/checkins", {
    params,
  });
  return data.items;
}

export async function fetchReportViolations(examId?: number) {
  const { data } = await client.get("/api/admin/reports/violations", {
    params: { exam_id: examId },
  });
  return data.items;
}
