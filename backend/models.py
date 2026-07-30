from sqlalchemy import Column, String, Integer, Float, Date, Time, JSON, text
from sqlalchemy import Column, String, Integer, Float, Date, Time, JSON, text, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(String(50), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    customer_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(120), nullable=False)
    branch = Column(String(100), nullable=False)
    date = Column(Date, nullable=False) # YYYY-MM-DD
    time = Column(Time, nullable=False) # HH:MM:SS
    guests = Column(Integer, nullable=False)
    table_type = Column(String(50), nullable=False)
    table_number = Column(String(20), nullable=True) # Assigned by admin
    special_requests = Column(JSON, nullable=True) # Store JSON of boolean flags and notes
    status = Column(String(50), default='pending')
    created_at = Column(String(50), default=lambda: str(datetime.utcnow()))
    updated_at = Column(String(50), default=lambda: str(datetime.utcnow()), onupdate=lambda: str(datetime.utcnow()))

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), nullable=False) # admin, staff, kitchen, delivery, customer
    status = Column(String(20), default="active")
    created_at = Column(String(50), default=lambda: str(datetime.utcnow()))
    updated_at = Column(String(50), default=lambda: str(datetime.utcnow()), onupdate=lambda: str(datetime.utcnow()))

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(50))
    image = Column(String(255))
    
    recipes = relationship("RecipeItem", back_populates="menu_item")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    stock_quantity = Column(Float, default=0.0)
    unit = Column(String(20))

class RecipeItem(Base):
    __tablename__ = "recipe_items"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity_required = Column(Float, nullable=False)

    menu_item = relationship("MenuItem", back_populates="recipes")
    ingredient = relationship("Ingredient")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    status = Column(String(50), default="Pending")
    created_at = Column(Float, default=lambda: datetime.utcnow().timestamp())
    customer_name = Column(String(100))
    address = Column(String(255))
    order_type = Column(String(50))
    table_number = Column(String(20))
    customer_email = Column(String(120))
    total = Column(String(50))
    
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(String(50), nullable=True)
    name = Column(String(100))
    price = Column(Float)
    quantity = Column(Integer)

    order = relationship("Order", back_populates="items")

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_percentage = Column(Float, nullable=False)
    active = Column(String(10), default="true") # "true" or "false" to avoid bool issues with sqlite/postgres mixups

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100))
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(Float, default=lambda: datetime.utcnow().timestamp())

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_name = Column(String(100), default="Elaxora")
    email = Column(String(120), default="contact@elaxora.com")
    phone = Column(String(20), default="+91 6374578233")
    address = Column(String(255), default="123 Luxury Lane, Culinary District")
    tax_rate = Column(Float, default=8.5)
    service_fee = Column(Float, default=15.0)
    delivery_fee = Column(Float, default=5.0)
    # We can store hours as a JSON string for simplicity, or just individual columns
    hours_json = Column(JSON, nullable=True)
