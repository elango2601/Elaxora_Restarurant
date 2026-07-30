from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, time as dtime
from typing import List, Optional
import uuid

import models, schemas, database, auth, stripe_utils
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Premium Reservation API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.4:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, credentials: HTTPAuthorizationCredentials = Depends(security)):
        token = credentials.credentials
        payload = auth.verify_token(token)
        if not payload:
            print("RoleChecker: Invalid token payload")
            raise HTTPException(status_code=401, detail="Invalid token")
        role = payload.get("role", "").lower()
        print(f"RoleChecker: extracted role '{role}' from token. Allowed roles: {self.allowed_roles}")
        if role not in self.allowed_roles:
            print("RoleChecker: Operation not permitted")
            raise HTTPException(status_code=403, detail="Operation not permitted")
        return payload


# Helper function for generating response envelopes
def success_response(data, message="Success"):
    return {"success": True, "data": data, "message": message}

@app.get("/")
def read_root():
    return {"message": "Welcome to Premium Reservation API"}

@app.get("/available-slots")
def get_available_slots(branch: str, date: date, db: Session = Depends(database.get_db)):
    # Standard time slots
    slots = [
        dtime(12, 0), dtime(12, 30), dtime(13, 0), dtime(13, 30),
        dtime(18, 0), dtime(18, 30), dtime(19, 0), dtime(19, 30), dtime(20, 0)
    ]
    
    # In a real app, this would check table capacity vs reservations.
    # For now, we mock some random unavailability or just return all true
    # based on existing reservations for this branch & date.
    existing = db.query(models.Reservation).filter(
        models.Reservation.date == date,
        models.Reservation.branch == branch,
        models.Reservation.status.in_(['pending', 'confirmed'])
    ).all()
    
    booked_times = {}
    for res in existing:
        booked_times[res.time] = booked_times.get(res.time, 0) + 1
        
    result = []
    TOTAL_TABLES = 10  # Mock threshold
    for s in slots:
        is_full = booked_times.get(s, 0) >= TOTAL_TABLES
        result.append({
            "time": s.strftime("%H:%M"),
            "available": not is_full
        })
        
    return success_response(result)

@app.post("/reservation")
async def create_reservation(res: schemas.ReservationCreate, db: Session = Depends(database.get_db)):
    db_res = models.Reservation(**res.dict())
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    
    res_dict = schemas.ReservationResponse.from_orm(db_res).dict()
    
    # Broadcast to websocket clients (admin/staff)
    await manager.broadcast({
        "type": "new_reservation",
        "data": res_dict
    })
    
    return success_response(res_dict, "Reservation created successfully")

@app.get("/reservations", dependencies=[Depends(RoleChecker(["admin", "staff"]))])
def admin_get_reservations(db: Session = Depends(database.get_db)):
    reservations = db.query(models.Reservation).order_by(models.Reservation.date.desc(), models.Reservation.time.desc()).all()
    res_list = [schemas.ReservationResponse.from_orm(r).dict() for r in reservations]
    return success_response(res_list)

@app.put("/reservation/{id}", dependencies=[Depends(RoleChecker(["admin", "staff"]))])
async def update_reservation(id: uuid.UUID, res_update: schemas.ReservationUpdate, db: Session = Depends(database.get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.reservation_id == id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
        
    update_data = res_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_res, key, value)
        
    db.commit()
    db.refresh(db_res)
    res_dict = schemas.ReservationResponse.from_orm(db_res).dict()
    await manager.broadcast({"type": "update_reservation", "data": res_dict})
    return success_response(res_dict, "Reservation updated")

@app.delete("/reservation/{id}", dependencies=[Depends(RoleChecker(["admin", "staff"]))])
async def cancel_reservation(id: uuid.UUID, db: Session = Depends(database.get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.reservation_id == id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    db_res.status = 'cancelled'
    db.commit()
    await manager.broadcast({"type": "cancel_reservation", "id": str(id)})
    return success_response({"id": str(id)}, "Reservation cancelled")

@app.patch("/reservation/status", dependencies=[Depends(RoleChecker(["admin", "staff"]))])
async def update_status(status_update: schemas.ReservationUpdateStatus, db: Session = Depends(database.get_db)):
    db_res = db.query(models.Reservation).filter(models.Reservation.reservation_id == status_update.id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    db_res.status = status_update.status
    db.commit()
    db.refresh(db_res)
    res_dict = schemas.ReservationResponse.from_orm(db_res).dict()
    await manager.broadcast({"type": "update_reservation", "data": res_dict})
    return success_response(res_dict, f"Status updated to {status_update.status}")

# ==============================================================================
# AUTHENTICATION
# ==============================================================================

# RoleChecker and security moved to top of file

@app.post("/register", response_model=dict)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return success_response(schemas.UserResponse.from_orm(new_user).dict(), "User registered successfully")

@app.post("/login", response_model=dict)
def login_user(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "role": db_user.role}
    )
    refresh_token = auth.create_refresh_token(
        data={"sub": db_user.email, "role": db_user.role}
    )
    
    return success_response({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": schemas.UserResponse.from_orm(db_user).dict()
    }, "Login successful")

@app.post("/refresh", response_model=dict)
def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = auth.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    access_token = auth.create_access_token(
        data={"sub": payload.get("sub"), "role": payload.get("role")}
    )
    return success_response({
        "access_token": access_token,
        "token_type": "bearer"
    })

class GoogleLogin(schemas.BaseModel):
    token: str

@app.post("/google", response_model=dict)
def google_login(login_data: GoogleLogin, db: Session = Depends(database.get_db)):
    payload = auth.google_oauth_verify(login_data.token)
    if not payload:
        # Mock success for now since we don't have a real token
        payload = {"email": "mock@google.com", "name": "Google User"}
        
    db_user = db.query(models.User).filter(models.User.email == payload["email"]).first()
    if not db_user:
        # Create user
        hashed_password = auth.get_password_hash(str(uuid.uuid4()))
        db_user = models.User(
            name=payload.get("name", "Google User"),
            email=payload["email"],
            password_hash=hashed_password,
            role="customer"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "role": db_user.role}
    )
    refresh_token = auth.create_refresh_token(
        data={"sub": db_user.email, "role": db_user.role}
    )
    return success_response({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": schemas.UserResponse.from_orm(db_user).dict()
    }, "Google Login successful")

class ForgotPasswordRequest(schemas.BaseModel):
    email: schemas.EmailStr

@app.post("/forgot-password", response_model=dict)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if not db_user:
        # Don't reveal if email exists or not
        return success_response({}, "If the email is registered, a password reset link has been sent.")
    
    reset_token = auth.create_access_token({"sub": db_user.email, "type": "reset"})
    print(f"Mock Email sent to {req.email}. Reset Token: {reset_token}")
    return success_response({}, "If the email is registered, a password reset link has been sent.")

# ==============================================================================
# USER MANAGEMENT (ADMIN)
# ==============================================================================

@app.get("/admin/users", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def get_all_users(db: Session = Depends(database.get_db)):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    user_list = [schemas.UserResponse.from_orm(u).dict() for u in users]
    return success_response(user_list)

@app.post("/admin/users", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def create_user_admin(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return success_response(schemas.UserResponse.from_orm(new_user).dict(), f"{user.role.capitalize()} created successfully")

@app.delete("/admin/users/{user_id}", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def delete_user_admin(user_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(db_user)
    db.commit()
    return success_response({"id": user_id}, "User deleted successfully")

@app.get("/me", response_model=dict)
def get_current_user_profile(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(database.get_db)):
    payload = auth.verify_token(credentials.credentials)
    if not payload: raise HTTPException(status_code=401, detail="Invalid token")
    
    db_user = db.query(models.User).filter(models.User.email == payload.get("sub")).first()
    if not db_user: raise HTTPException(status_code=404, detail="User not found")
    
    return success_response(schemas.UserResponse.from_orm(db_user).dict())

class ProfileUpdate(schemas.BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None

@app.put("/me", response_model=dict)
def update_current_user_profile(update_data: ProfileUpdate, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(database.get_db)):
    payload = auth.verify_token(credentials.credentials)
    if not payload: raise HTTPException(status_code=401, detail="Invalid token")
    
    db_user = db.query(models.User).filter(models.User.email == payload.get("sub")).first()
    if not db_user: raise HTTPException(status_code=404, detail="User not found")
    
    if update_data.name:
        db_user.name = update_data.name
    if update_data.password:
        db_user.password_hash = auth.get_password_hash(update_data.password)
        
    db.commit()
    db.refresh(db_user)
    return success_response(schemas.UserResponse.from_orm(db_user).dict(), "Profile updated successfully")

# ==============================================================================
# MENU CRUD
# ==============================================================================

@app.get("/menu", response_model=dict)
def get_menu(db: Session = Depends(database.get_db)):
    items = db.query(models.MenuItem).all()
    # Mocking is_sold_out logic based on recipes for now
    menu_list = []
    for item in items:
        item_dict = schemas.MenuItemResponse.from_orm(item).dict()
        item_dict["is_sold_out"] = False
        menu_list.append(item_dict)
    return success_response(menu_list)

@app.post("/menu", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def create_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(database.get_db)):
    new_item = models.MenuItem(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return success_response(schemas.MenuItemResponse.from_orm(new_item).dict(), "Menu item created")

@app.put("/menu/{item_id}", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def update_menu_item(item_id: int, item: schemas.MenuItemCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return success_response(schemas.MenuItemResponse.from_orm(db_item).dict(), "Menu item updated")

@app.delete("/menu/{id}", dependencies=[Depends(RoleChecker(["admin"]))])
def delete_menu_item(id: int, db: Session = Depends(database.get_db)):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.delete(db_item)
    db.commit()
    return success_response({"id": id}, "Item deleted successfully")

# ==============================================================================
# INVENTORY CRUD
# ==============================================================================

@app.get("/admin/inventory", response_model=dict, dependencies=[Depends(RoleChecker(["admin", "kitchen"]))])
def get_inventory(db: Session = Depends(database.get_db)):
    ingredients = db.query(models.Ingredient).all()
    inv_list = [schemas.IngredientResponse.from_orm(i).dict() for i in ingredients]
    return success_response(inv_list)

@app.post("/admin/inventory", response_model=dict, dependencies=[Depends(RoleChecker(["admin", "kitchen"]))])
def create_inventory_item(item: schemas.IngredientCreate, db: Session = Depends(database.get_db)):
    db_item = models.Ingredient(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return success_response(schemas.IngredientResponse.from_orm(db_item).dict(), "Inventory item added successfully")

@app.put("/admin/inventory/{id}", response_model=dict, dependencies=[Depends(RoleChecker(["admin", "kitchen"]))])
def update_inventory_item(id: int, item_update: schemas.IngredientUpdate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Ingredient).filter(models.Ingredient.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    update_data = item_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    db.commit()
    db.refresh(db_item)
    return success_response(schemas.IngredientResponse.from_orm(db_item).dict(), "Inventory item updated successfully")

@app.delete("/admin/inventory/{id}", response_model=dict, dependencies=[Depends(RoleChecker(["admin", "kitchen"]))])
def delete_inventory_item(id: int, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Ingredient).filter(models.Ingredient.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.delete(db_item)
    db.commit()
    return success_response({"id": id}, "Inventory item deleted successfully")

# ==============================================================================
# CHECKOUT & STRIPE
# ==============================================================================

@app.post("/checkout", response_model=dict)
async def create_checkout(order_data: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    order_id = "ORD-" + str(uuid.uuid4()).split("-")[0].upper()
    
    # Save pending order
    db_order = models.Order(
        id=order_id,
        status="Pending",
        customer_name=order_data.customer_name,
        address=order_data.address,
        order_type=order_data.order_type,
        table_number=order_data.table_number,
        customer_email=order_data.customer_email,
        total=order_data.total
    )
    db.add(db_order)
    
    for item in order_data.items:
        db_item = models.OrderItem(
            order_id=order_id,
            menu_item_id=item.menu_item_id,
            name=item.name,
            price=item.price,
            quantity=item.quantity
        )
        db.add(db_item)
        
    db.commit()
    db.refresh(db_order)
    
    # Broadcast to kitchen and staff instantly
    items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
    order_dict = schemas.OrderResponse.from_orm(db_order).dict()
    order_dict["items"] = [schemas.OrderItemResponse.from_orm(item).dict() for item in items]
    
    await kitchen_manager.broadcast(order_dict)
    await manager.broadcast(order_dict)
    
    # Generate Stripe Session
    try:
        session = stripe_utils.create_checkout_session(order_id, order_data.items, order_data.customer_email)
        return success_response({"checkout_url": session.url})
    except Exception as e:
        # If stripe fails (e.g. no API key), bypass and go to success
        print("Stripe error/bypassed:", e)
        return success_response({"checkout_url": f"/checkout/success?order_id={order_id}"})

# ==============================================================================
# ORDERS ADMIN
# ==============================================================================

@app.get("/orders", response_model=dict, dependencies=[Depends(RoleChecker(["admin", "staff", "kitchen", "delivery"]))])
def get_all_orders(db: Session = Depends(database.get_db)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    # Need to load items manually since we don't have a relationship defined in models for quick serialization, or we can just fetch them
    result = []
    for order in orders:
        items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).all()
        order_dict = schemas.OrderResponse.from_orm(order).dict()
        order_dict["items"] = [schemas.OrderItemResponse.from_orm(item).dict() for item in items]
        result.append(order_dict)
    return success_response(result)

@app.post("/pos/orders", response_model=dict, dependencies=[Depends(RoleChecker(["admin", "staff", "kitchen"]))])
async def create_pos_order(order_data: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    order_id = "ORD-" + str(uuid.uuid4()).split("-")[0].upper()
    
    # Save pending order for Dine-In
    db_order = models.Order(
        id=order_id,
        status="Pending",
        customer_name=order_data.customer_name,
        address=order_data.address,
        order_type="Dine-In",
        table_number=order_data.table_number,
        customer_email=order_data.customer_email,
        total=order_data.total
    )
    db.add(db_order)
    
    for item in order_data.items:
        db_item = models.OrderItem(
            order_id=order_id,
            menu_item_id=item.menu_item_id,
            name=item.name,
            price=item.price,
            quantity=item.quantity
        )
        db.add(db_item)
        
    db.commit()
    db.refresh(db_order)
    
    # Re-fetch items to send complete order data to kitchen
    items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
    order_dict = schemas.OrderResponse.from_orm(db_order).dict()
    order_dict["items"] = [schemas.OrderItemResponse.from_orm(item).dict() for item in items]
    
    await kitchen_manager.broadcast(order_dict)
    
    return success_response({"order_id": order_id}, "Order sent to kitchen successfully")

class OrderStatusUpdate(schemas.BaseModel):
    status: str

@app.patch("/order/{order_id}/status", response_model=dict, dependencies=[Depends(RoleChecker(["admin", "staff", "kitchen", "delivery"]))])
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, db: Session = Depends(database.get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db_order.status = status_update.status
    db.commit()
    db.refresh(db_order)
    
    # Broadcast to relevant websockets
    # Re-fetch items to send complete order data
    items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
    order_dict = schemas.OrderResponse.from_orm(db_order).dict()
    order_dict["items"] = [schemas.OrderItemResponse.from_orm(item).dict() for item in items]
    
    if status_update.status in ["Pending", "Preparing", "Ready", "Completed"]:
        await kitchen_manager.broadcast(order_dict)
        
    if status_update.status in ["Ready", "Out for Delivery", "Delivered"]:
        await delivery_manager.broadcast(order_dict)
        
    # Also broadcast to main manager (Staff/Admin) for live notifications
    await manager.broadcast(order_dict)
        
    return success_response(order_dict, f"Order status updated to {status_update.status}")

# ==============================================================================
# WEBSOCKETS (REAL-TIME UPDATES)
# ==============================================================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()
kitchen_manager = ConnectionManager()
delivery_manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/kitchen")
async def websocket_kitchen(websocket: WebSocket):
    await kitchen_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        kitchen_manager.disconnect(websocket)

@app.websocket("/ws/delivery")
async def websocket_delivery(websocket: WebSocket):
    await delivery_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        delivery_manager.disconnect(websocket)
        
# Example of broadcasting when a reservation is made (inject into create_reservation)
# In real app, we would make create_reservation async or run broadcast in a background task




from fastapi import Request

@app.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(database.get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    
    event = None
    try:
        import stripe
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        order_id = session['metadata']['order_id']
        
        db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
        if db_order:
            db_order.status = "Paid"
            db.commit()
            
    return {"status": "success"}

# ==============================================================================
# MARKETING & REVIEWS
# ==============================================================================

@app.get("/admin/coupons", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def get_coupons(db: Session = Depends(database.get_db)):
    coupons = db.query(models.Coupon).all()
    c_list = [schemas.CouponResponse.from_orm(c).dict() for c in coupons]
    return success_response(c_list)

@app.post("/admin/coupons", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def create_coupon(coupon: schemas.CouponCreate, db: Session = Depends(database.get_db)):
    db_coupon = models.Coupon(**coupon.dict())
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)
    return success_response(schemas.CouponResponse.from_orm(db_coupon).dict(), "Coupon created successfully")

@app.delete("/admin/coupons/{id}", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def delete_coupon(id: int, db: Session = Depends(database.get_db)):
    db_coupon = db.query(models.Coupon).filter(models.Coupon.id == id).first()
    if not db_coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
        
    db.delete(db_coupon)
    db.commit()
    return success_response({"id": id}, "Coupon deleted successfully")

@app.get("/admin/reviews", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def get_reviews(db: Session = Depends(database.get_db)):
    reviews = db.query(models.Review).all()
    r_list = [schemas.ReviewResponse.from_orm(r).dict() for r in reviews]
    return success_response(r_list)

@app.delete("/admin/reviews/{id}", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def delete_review(id: int, db: Session = Depends(database.get_db)):
    db_review = db.query(models.Review).filter(models.Review.id == id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    db.delete(db_review)
    db.commit()
    return success_response({"id": id}, "Review deleted successfully")

# ==============================================================================
# SYSTEM SETTINGS
# ==============================================================================

@app.get("/settings", response_model=dict)
def get_settings(db: Session = Depends(database.get_db)):
    settings = db.query(models.SystemSettings).first()
    if not settings:
        # Auto-seed default settings if missing
        settings = models.SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return success_response(schemas.SystemSettingsResponse.from_orm(settings).dict())

@app.patch("/settings", response_model=dict, dependencies=[Depends(RoleChecker(["admin"]))])
def update_settings(settings_update: schemas.SystemSettingsBase, db: Session = Depends(database.get_db)):
    settings = db.query(models.SystemSettings).first()
    if not settings:
        settings = models.SystemSettings()
        db.add(settings)
    
    # Update fields
    settings.restaurant_name = settings_update.restaurant_name
    settings.email = settings_update.email
    settings.phone = settings_update.phone
    settings.address = settings_update.address
    settings.tax_rate = settings_update.tax_rate
    settings.service_fee = settings_update.service_fee
    settings.delivery_fee = settings_update.delivery_fee
    settings.hours_json = settings_update.hours_json
    
    db.commit()
    db.refresh(settings)
    return success_response(schemas.SystemSettingsResponse.from_orm(settings).dict(), "Settings updated successfully")

@app.get("/seed-database")
def trigger_seed():
    import seed
    try:
        seed.seed_db()
        return {"message": "Database seeded successfully from the cloud!"}
    except Exception as e:
        return {"error": str(e)}
