from database import engine, SessionLocal
import models
import datetime
import uuid
import json

def seed_db():
    print("Creating tables...")
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Seeding reservations...")
    today = datetime.date.today()
    
    sample_reservations = [
        {
            "customer_name": "Elon Musk",
            "phone": "+1 555-1234",
            "email": "elon@spacex.com",
            "branch": "Main Branch",
            "date": today,
            "time": datetime.time(19, 0),
            "guests": 4,
            "table_type": "VIP Lounge",
            "special_requests": {"notes": "No paparazzi please."},
            "status": "confirmed"
        },
        {
            "customer_name": "Jane Doe",
            "phone": "+1 555-5678",
            "email": "jane@example.com",
            "branch": "Downtown Premium",
            "date": today,
            "time": datetime.time(19, 30),
            "guests": 2,
            "table_type": "Window Seat",
            "special_requests": {"Anniversary": True},
            "status": "pending"
        },
        {
            "customer_name": "John Smith",
            "phone": "+1 555-9999",
            "email": "john.smith@example.com",
            "branch": "Main Branch",
            "date": today + datetime.timedelta(days=1),
            "time": datetime.time(12, 30),
            "guests": 6,
            "table_type": "Family Booth",
            "special_requests": {"High Chair": True},
            "status": "confirmed"
        }
    ]
    
    for r in sample_reservations:
        db_res = models.Reservation(**r)
        db.add(db_res)
        
    db.commit()
    print("Seed complete! Added 3 dummy reservations.")

if __name__ == "__main__":
    seed_db()
