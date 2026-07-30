from database import engine, Base
import models
Base.metadata.create_all(bind=engine)
print("Settings table created (if it didn't exist)!")
