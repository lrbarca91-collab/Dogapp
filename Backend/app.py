from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
from database import DB
from models import Dog, Sponsorship, AdoptionApplication

app = Flask(__name__)
CORS(app)

db_user = os.getenv('POSTGRES_USER', 'dogapp_user')
db_password = os.getenv('POSTGRES_PASSWORD', 'dogapp_password123')
db_name = os.getenv('POSTGRES_DB', 'dogapp_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@db:5432/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

DB.init_app(app)

with app.app_context():
    DB.create_all()

# PayPal Configuration
PAYPAL_CLIENT_ID = os.getenv('PAYPAL_CLIENT_ID', 'YOUR_PAYPAL_CLIENT_ID')
PAYPAL_CLIENT_SECRET = os.getenv('PAYPAL_CLIENT_SECRET', 'YOUR_PAYPAL_CLIENT_SECRET')
PAYPAL_MODE = os.getenv('PAYPAL_MODE', 'sandbox')
PAYPAL_API_URL = f'https://api.{PAYPAL_MODE}.paypal.com'


def get_paypal_access_token():
    """Get PayPal access token for API calls"""
    auth = (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    headers = {'Accept': 'application/json', 'Accept-Language': 'en_US'}
    data = {'grant_type': 'client_credentials'}
    
    response = requests.post(f'{PAYPAL_API_URL}/v1/oauth2/token', auth=auth, headers=headers, data=data)
    if response.status_code == 200:
        return response.json()['access_token']
    return None


@app.route('/dogs', methods=['GET'])
def get_dogs():
    dogs = Dog.query.all()

    result = []

    for dog in dogs:
        result.append({
            'id': dog.id,
            'name': dog.name,
            'breed': dog.breed,
            'age': dog.age,
            'weight': dog.weight,
            'location': dog.location,
            'temperament': dog.temperament,
            'health_issues': dog.health_issues,
            'vaccinated': dog.vaccinated,
            'spayed': dog.spayed,
            'sponsorship_total': dog.sponsorship_total,
            'adopted': dog.adopted,
            'image_url': dog.image_url
        })

    return jsonify(result)


@app.route('/adopt', methods=['POST'])
def adopt_dog():
    data = request.json

    application = AdoptionApplication(
        dog_id=data['dog_id'],
        full_name=data['full_name'],
        age=data['age'],
        address=data['address'],
        email=data['email'],
        phone=data['phone']
    )

    DB.session.add(application)
    DB.session.commit()

    return jsonify({'message': 'Application submitted'})


@app.route('/sponsor', methods=['POST'])
def sponsor_dog():
    data = request.json

    sponsorship = Sponsorship(
        dog_id=data['dog_id'],
        amount=data['amount'],
        sponsor_name=data['sponsor_name']
    )

    dog = Dog.query.get(data['dog_id'])

    if dog:
        dog.sponsorship_total += float(data['amount'])

    DB.session.add(sponsorship)
    DB.session.commit()

    return jsonify({'message': 'Sponsorship successful'})


@app.route('/create-paypal-order', methods=['POST'])
def create_paypal_order():
    """Create a PayPal order for sponsorship"""
    try:
        data = request.json
        amount = data.get('amount')
        dog_id = data.get('dog_id')
        
        if not amount or amount <= 0:
            return jsonify({'error': 'Invalid amount'}), 400
        
        access_token = get_paypal_access_token()
        if not access_token:
            return jsonify({'error': 'Failed to authenticate with PayPal'}), 500
        
        dog = Dog.query.get(dog_id)
        if not dog:
            return jsonify({'error': 'Dog not found'}), 404
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        payload = {
            'intent': 'CAPTURE',
            'purchase_units': [
                {
                    'reference_id': f'dog_{dog_id}_sponsor',
                    'description': f'Sponsorship for {dog.name}',
                    'amount': {
                        'currency_code': 'USD',
                        'value': str(amount)
                    }
                }
            ],
            'application_context': {
                'return_url': os.getenv('PAYPAL_RETURN_URL', 'http://localhost/success'),
                'cancel_url': os.getenv('PAYPAL_CANCEL_URL', 'http://localhost/cancel'),
                'brand_name': 'Dog Rescue App',
                'user_action': 'PAY'
            }
        }
        
        response = requests.post(f'{PAYPAL_API_URL}/v2/checkout/orders', headers=headers, json=payload)
        
        if response.status_code == 201:
            order_data = response.json()
            return jsonify({'order_id': order_data['id']}), 201
        else:
            return jsonify({'error': 'Failed to create PayPal order'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/capture-paypal-order', methods=['POST'])
def capture_paypal_order():
    """Capture a PayPal order after approval"""
    try:
        data = request.json
        order_id = data.get('order_id')
        dog_id = data.get('dog_id')
        sponsor_name = data.get('sponsor_name')
        amount = data.get('amount')
        
        access_token = get_paypal_access_token()
        if not access_token:
            return jsonify({'error': 'Failed to authenticate with PayPal'}), 500
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        response = requests.post(
            f'{PAYPAL_API_URL}/v2/checkout/orders/{order_id}/capture',
            headers=headers
        )
        
        if response.status_code == 201:
            # Payment successful, record sponsorship
            sponsorship = Sponsorship(
                dog_id=dog_id,
                amount=float(amount),
                sponsor_name=sponsor_name
            )
            
            dog = Dog.query.get(dog_id)
            if dog:
                dog.sponsorship_total += float(amount)
            
            DB.session.add(sponsorship)
            DB.session.commit()
            
            return jsonify({'message': 'Sponsorship successful', 'status': 'success'}), 201
        else:
            return jsonify({'error': 'Failed to capture PayPal order'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'dog-rescue-backend'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
