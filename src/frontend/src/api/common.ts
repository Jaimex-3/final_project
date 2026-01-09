const API_BASE = import.meta.env.VITE_API_BASE || "";

export function getUploadUrl(path: string) {
  if (!path) return "";
  // DB stores "uploads/reference/filename.jpg"
  // Backend route /api/common/uploads/ serves from "src/backend/uploads/"
  // So we need to remove "uploads/" from the path
  const cleanPath = path.replace(/^uploads\//, "");
  return `${API_BASE}/api/common/uploads/${cleanPath}`;
}
