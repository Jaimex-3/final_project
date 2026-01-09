from app import create_app
from app.extensions import db
from app.models.student import Student
from sqlalchemy.exc import IntegrityError

app = create_app()

def seed_students():
    with app.app_context():
        print("Seeding students...")
        students = [
            {"student_number": f"S{1000 + i}", "full_name": f"Student {i}", "email": f"student{i}@example.com"}
            for i in range(1, 21)
        ]
        
        count = 0
        for s_data in students:
            if not Student.query.filter_by(student_number=s_data["student_number"]).first():
                student = Student(
                    student_number=s_data["student_number"],
                    full_name=s_data["full_name"],
                    email=s_data["email"]
                )
                db.session.add(student)
                count += 1
        
        try:
            db.session.commit()
            print(f"Added {count} new students.")
        except IntegrityError:
            db.session.rollback()
            print("IntegrityError: Duplicate students skipped.")

if __name__ == "__main__":
    seed_students()
