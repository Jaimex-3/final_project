from pathlib import Path
from typing import Dict

try:
    import face_recognition  # type: ignore
except Exception:  # pragma: no cover - library optional
    face_recognition = None  # noqa: N816

from ..extensions import db
from ..models import Student
from ..ml.client import FakeMLService, MLService


class FaceRecognitionService(MLService):
    """
    Lightweight wrapper around face_recognition (dlib) to keep dependencies optional.
    Swappable via dependency injection; tests should mock or use FakeMLService.

    To plug a real provider later, implement MLService.verify_student_face and
    register it in the app container.
    """

    def __init__(self, tolerance: float = 0.6):
        self.tolerance = tolerance

    def verify_student_face(self, student_id: int, uploaded_image_path: Path) -> Dict[str, object]:
        student = Student.query.get(student_id)
        if not student:
            return {"match": False, "score": 0.0, "reason": "student_not_found"}

        ref_photo = (
            db.session.query(Student)
            .filter(Student.id == student_id)
            .with_entities(Student.id)
            .first()
        )  # placeholder; replace with reference photo query when model added

        if face_recognition is None:
            return {"match": False, "score": 0.0, "reason": "ml_library_unavailable"}

        # Load uploaded image
        uploaded_image = face_recognition.load_image_file(str(uploaded_image_path))
        uploaded_faces = face_recognition.face_encodings(uploaded_image)
        if len(uploaded_faces) == 0:
            return {"match": False, "score": 0.0, "reason": "no_face_detected"}
        if len(uploaded_faces) > 1:
            return {"match": False, "score": 0.0, "reason": "multiple_faces_detected"}

        uploaded_embedding = uploaded_faces[0]

        # Here we would load student's reference embeddings; stubbed as same image for illustration.
        # Replace the following with actual reference embedding retrieval.
        reference_embedding = uploaded_embedding

        distances = face_recognition.face_distance([reference_embedding], uploaded_embedding)
        score = 1.0 - float(distances[0])  # higher is better
        match = distances[0] <= self.tolerance

        return {"match": bool(match), "score": score, "reason": "ok" if match else "mismatch"}


__all__ = ["MLService", "FakeMLService", "FaceRecognitionService"]
