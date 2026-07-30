import models, database
from auth import get_password_hash
import datetime
from sqlalchemy.orm import Session

def seed_db():
    models.Base.metadata.drop_all(bind=database.engine)
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    
    # Add System Settings
    settings = models.SystemSettings(
        restaurant_name="Elaxora",
        email="contact@elaxora.com",
        phone="+91 6374578233",
        address="123 Luxury Lane, Culinary District",
        tax_rate=8.5,
        service_fee=15.0,
        delivery_fee=5.0
    )
    db.add(settings)

    # Add Users
    users = [
        models.User(name="Admin User", email="admin@elaxora.com", password_hash=get_password_hash("password123"), role="admin"),
        models.User(name="Staff User", email="staff@elaxora.com", password_hash=get_password_hash("password123"), role="staff"),
        models.User(name="Kitchen Staff", email="kitchen@elaxora.com", password_hash=get_password_hash("password123"), role="kitchen"),
        models.User(name="Delivery Driver", email="delivery@elaxora.com", password_hash=get_password_hash("password123"), role="delivery")
    ]
    db.add_all(users)

    # Add Menu Categories and Items (Tamil)
    menu_items = [
        models.MenuItem(name="Thalappakatti Biryani", description="Authentic Dindigul style mutton biryani.", price=250.00, category="Mains", is_available=True, image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80"),
        models.MenuItem(name="Chicken 65", description="Spicy deep-fried chicken starter from Chennai.", price=180.00, category="Starters", is_available=True, image_url="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80"),
        models.MenuItem(name="Filter Coffee", description="Classic South Indian degree coffee.", price=50.00, category="Beverages", is_available=True, image_url="https://images.unsplash.com/photo-1551030173-122aabc4489c?w=800&q=80"),
        models.MenuItem(name="Masala Dosa", description="Crispy crepe served with sambar and chutney.", price=120.00, category="Mains", is_available=True, image_url="https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=800&q=80"),
        models.MenuItem(name="Chettinad Fish Fry", description="Spicy and aromatic shallow-fried fish.", price=220.00, category="Starters", is_available=True, image_url="https://images.unsplash.com/photo-1599487405270-8950ea605b0f?w=800&q=80"),
        models.MenuItem(name="Gulab Jamun", description="Soft milk dumplings in rose-flavored sugar syrup.", price=80.00, category="Desserts", is_available=True, image_url="https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=800&q=80")
    ]
    db.add_all(menu_items)

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
