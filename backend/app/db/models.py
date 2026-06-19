from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)
    nickname = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    height = Column(Integer, nullable=True)
    weight = Column(Integer, nullable=True)
    original_photo_url = Column(String, nullable=True)
    base_avatar_url = Column(String, nullable=True)
    user_profile_tags = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class WardrobeItem(Base):
    __tablename__ = "wardrobe_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)
    image_url = Column(String, nullable=False)
    color = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)
    source = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    scene = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    items = relationship("OutfitItem", cascade="all, delete-orphan", back_populates="outfit")


class OutfitItem(Base):
    __tablename__ = "outfit_items"

    id = Column(Integer, primary_key=True, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id"), nullable=False)
    wardrobe_item_id = Column(Integer, ForeignKey("wardrobe_items.id"), nullable=True)
    image_url = Column(String, nullable=True)
    name = Column(String, nullable=True)
    category = Column(String, nullable=True)

    outfit = relationship("Outfit", back_populates="items")


class TryonRecord(Base):
    __tablename__ = "tryon_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    type = Column(String, index=True, nullable=False)
    scene = Column(String, nullable=True)
    input_photo_url = Column(String, nullable=True)
    product_url = Column(String, nullable=True)
    styling_suggestion = Column(Text, nullable=True)
    generated_product_url = Column(String, nullable=True)
    final_tryon_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class DiscoverPost(Base):
    __tablename__ = "discover_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    image_url = Column(String, nullable=False)
    author_name = Column(String, nullable=False)
    author_avatar_url = Column(String, nullable=True)
    scene = Column(String, index=True, nullable=True)
    channel = Column(String, index=True, nullable=True)
    like_count = Column(Integer, default=0, nullable=False)
    favorite_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class DiscoverInteraction(Base):
    __tablename__ = "discover_interactions"
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_discover_interaction_user_post"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    post_id = Column(Integer, ForeignKey("discover_posts.id"), index=True, nullable=False)
    liked = Column(Boolean, default=False, nullable=False)
    favorited = Column(Boolean, default=False, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
