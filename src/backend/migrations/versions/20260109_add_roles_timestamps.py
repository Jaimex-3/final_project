"""sync schema timestamps

Revision ID: 20260109_add_roles_timestamps
Revises: 
Create Date: 2026-01-09 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260109_add_roles_timestamps'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # roles
    op.add_column('roles', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('roles', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    
    # rooms
    op.add_column('rooms', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('rooms', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

    # seats
    op.add_column('seats', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('seats', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

    # checkins
    op.add_column('checkins', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('checkins', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

    # students
    op.add_column('students', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

    # seating_plans
    op.add_column('seating_plans', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

    # seat_assignments
    op.add_column('seat_assignments', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

    # student_reference_photos
    op.add_column('student_reference_photos', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

    # violations
    op.add_column('violations', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))


def downgrade():
    # violations
    op.drop_column('violations', 'updated_at')

    # student_reference_photos
    op.drop_column('student_reference_photos', 'updated_at')

    # seat_assignments
    op.drop_column('seat_assignments', 'updated_at')

    # seating_plans
    op.drop_column('seating_plans', 'updated_at')

    # students
    op.drop_column('students', 'updated_at')

    # checkins
    op.drop_column('checkins', 'updated_at')
    op.drop_column('checkins', 'created_at')

    # seats
    op.drop_column('seats', 'updated_at')
    op.drop_column('seats', 'created_at')

    # rooms
    op.drop_column('rooms', 'updated_at')
    op.drop_column('rooms', 'created_at')

    # roles
    op.drop_column('roles', 'updated_at')
    op.drop_column('roles', 'created_at')