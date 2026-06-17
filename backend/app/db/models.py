from sqlalchemy import Column, Integer, String, JSON
from app.db.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    height = Column(Integer, nullable=True)
    weight = Column(Integer, nullable=True)
    original_photo_url = Column(String, nullable=True)
    base_avatar_url = Column(String, nullable=True)
    user_profile_tags = Column(JSON, nullable=True)
