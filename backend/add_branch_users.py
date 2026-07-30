import requests
import json

base_url = "http://127.0.0.1:8000"

users = [
    {
        "name": "Main Branch Admin",
        "email": "main@elaxora.com",
        "password": "password123",
        "role": "admin"
    },
    {
        "name": "Downtown Premium Admin",
        "email": "downtown@elaxora.com",
        "password": "password123",
        "role": "admin"
    },
    {
        "name": "Skyline Rooftop Admin",
        "email": "rooftop@elaxora.com",
        "password": "password123",
        "role": "admin"
    }
]

for user in users:
    try:
        res = requests.post(f"{base_url}/register", json=user)
        if res.status_code == 200:
            print(f"Successfully created: {user['email']}")
        else:
            print(f"Failed to create {user['email']}: {res.text}")
    except Exception as e:
        print(f"Error for {user['email']}: {e}")
