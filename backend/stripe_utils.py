import os
import stripe
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
DOMAIN_URL = os.environ.get('DOMAIN_URL', 'http://localhost:3000')

def create_checkout_session(order_id: str, items: list, customer_email: str):
    line_items = []
    for item in items:
        line_items.append({
            'price_data': {
                'currency': 'inr',
                'product_data': {
                    'name': item.name,
                },
                'unit_amount': int(item.price * 100),
            },
            'quantity': item.quantity,
        })
        
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=line_items,
        mode='payment',
        success_url=DOMAIN_URL + f'/checkout/success?session_id={{CHECKOUT_SESSION_ID}}&order_id={order_id}',
        cancel_url=DOMAIN_URL + '/menu',
        customer_email=customer_email,
        metadata={
            'order_id': order_id
        }
    )
    return session
