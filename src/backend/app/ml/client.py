from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict


class MLService(ABC):
    """
    Interface for ML integrations. Implementations can wrap real libraries
    (e.g., face_recognition, AWS Rekognition). Keep this mockable in tests.
    """

    @abstractmethod
    def verify_student_face(self, student_id: int, uploaded_image_path: Path) -> Dict[str, object]:
        """
        Compare an uploaded face image against the student's reference embedding/photo.

        Returns a dict: {match: bool, score: float, reason: str}
        """
        raise NotImplementedError


class FakeMLService(MLService):
    """
    Deterministic fake for tests. Configure thresholds or behaviors via constructor.
    """

    def __init__(self, should_match: bool = True, score: float = 0.95, reason: str = "ok"):
        self.should_match = should_match
        self.score = score
        self.reason = reason

    def verify_student_face(self, student_id: int, uploaded_image_path: Path) -> Dict[str, object]:
        return {"match": self.should_match, "score": float(self.score), "reason": self.reason}
