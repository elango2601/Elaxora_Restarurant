from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List

class ReservationCreate(BaseModel):
    customer_name: str
    phone: str
    email: EmailStr
    branch: str
    date: str
    time: str
    guests: int
    table_type: str
    special_requests: Optional[Dict[str, Any]] = None

class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    table_number: Optional[int] = None
    time: Optional[str] = None

class ReservationResponse(ReservationCreate):
    reservation_id: Any
    status: str
    table_number: Optional[Any] = None
    date: Any
    time: Any

    class Config:
        from_attributes = True

class ReservationUpdateStatus(BaseModel):
    id: str
    status: str

# ----------------- Users -----------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

# ----------------- Menu & Recipes -----------------
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image: Optional[str] = None

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    id: int

    class Config:
        from_attributes = True

class IngredientBase(BaseModel):
    name: str
    stock_quantity: float
    unit: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    stock_quantity: Optional[float] = None
    unit: Optional[str] = None

class IngredientResponse(BaseModel):
    id: int
    name: str
    stock_quantity: float
    unit: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Orders -----------------
class OrderItemCreate(BaseModel):
    menu_item_id: str
    name: str
    price: float
    quantity: int

class OrderCreate(BaseModel):
    customer_name: Optional[str] = None
    address: Optional[str] = None
    order_type: Optional[str] = None
    table_number: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    total: str
    items: List[OrderItemCreate]

class OrderItemResponse(OrderItemCreate):
    id: int

    class Config:
        from_attributes = True

class OrderResponse(OrderCreate):
    id: str
    status: str
    created_at: float
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

# ----------------- Marketing & Reviews -----------------
class CouponCreate(BaseModel):
    code: str
    discount_percentage: float
    active: Optional[str] = "true"

class CouponResponse(CouponCreate):
    id: int

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    customer_name: Optional[str] = "Anonymous"
    rating: int
    comment: Optional[str] = None

class ReviewResponse(ReviewCreate):
    id: int
    created_at: float

    class Config:
        from_attributes = True

# ----------------- System Settings -----------------
class SystemSettingsBase(BaseModel):
    restaurant_name: str
    email: str
    phone: str
    address: str
    tax_rate: float
    service_fee: float
    delivery_fee: float
    hours_json: Optional[Any] = None

class SystemSettingsCreate(SystemSettingsBase):
    pass

class SystemSettingsResponse(SystemSettingsBase):
    id: int

    class Config:
        from_attributes = True
