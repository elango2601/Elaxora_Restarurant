import requests
res = requests.post("http://127.0.0.1:8000/login", json={"email": "admin@elaxora.com", "password": "admin123"})
token = res.json().get("data", {}).get("access_token")
if token:
    res2 = requests.get("http://127.0.0.1:8000/reservations", headers={"Authorization": f"Bearer {token}"})
    print(res2.text)
