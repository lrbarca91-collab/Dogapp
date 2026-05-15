#!/usr/bin/env python
import os
import sys
sys.path.insert(0, '/app')

from flask import Flask
from database import DB
from models import Dog

app = Flask(__name__)

db_user = os.getenv('POSTGRES_USER', 'dogapp_user')
db_password = os.getenv('POSTGRES_PASSWORD', 'dogapp_password123')
db_name = os.getenv('POSTGRES_DB', 'dogapp_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@db:5432/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

DB.init_app(app)

# Using diverse dog images from Unsplash (high-quality, different dogs each time)
sample_dogs = [
    {
        'name': 'Max',
        'breed': 'Golden Retriever',
        'age': 3,
        'weight': '65 lbs',
        'location': 'New York',
        'temperament': 'Friendly, playful, energetic',
        'health_issues': 'None',
        'vaccinated': True,
        'spayed': False,
        'adopted': False,
        'image_url': 'https://images.unsplash.com/photo-1633722715463-d30628519a0a?w=600&h=400&fit=crop'
    },
    {
        'name': 'Luna',
        'breed': 'Siberian Husky',
        'age': 2,
        'weight': '55 lbs',
        'location': 'Los Angeles',
        'temperament': 'Intelligent, independent, loyal',
        'health_issues': 'None',
        'vaccinated': True,
        'spayed': True,
        'adopted': False,
        'image_url': 'https://images.unsplash.com/photo-1605025614365-f0bbed297f2e?w=600&h=400&fit=crop'
    },
    {
        'name': 'Charlie',
        'breed': 'Labrador Retriever',
        'age': 5,
        'weight': '70 lbs',
        'location': 'Chicago',
        'temperament': 'Gentle, obedient, even-tempered',
        'health_issues': 'Mild arthritis',
        'vaccinated': True,
        'spayed': False,
        'adopted': False,
        'image_url': 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=600&h=400&fit=crop'
    },
    {
        'name': 'Bella',
        'breed': 'German Shepherd',
        'age': 4,
        'weight': '60 lbs',
        'location': 'Houston',
        'temperament': 'Confident, courageous, smart',
        'health_issues': 'None',
        'vaccinated': True,
        'spayed': True,
        'adopted': False,
        'image_url': 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&h=400&fit=crop'
    },
    {
        'name': 'Bailey',
        'breed': 'Beagle',
        'age': 2,
        'weight': '25 lbs',
        'location': 'Phoenix',
        'temperament': 'Curious, merry, determined',
        'health_issues': 'None',
        'vaccinated': True,
        'spayed': False,
        'adopted': False,
        'image_url': 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&h=400&fit=crop'
    },
    {
        'name': 'Daisy',
        'breed': 'Poodle',
        'age': 3,
        'weight': '40 lbs',
        'location': 'Philadelphia',
        'temperament': 'Intelligent, athletic, elegant',
        'health_issues': 'None',
        'vaccinated': True,
        'spayed': True,
        'adopted': False,
        'image_url': 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&h=400&fit=crop'
    },
    {
        'name': 'Rocky',
        'breed': 'Bulldog',
        'age': 6,
        'weight': '50 lbs',
        'location': 'San Antonio',
        'temperament': 'Affectionate, dignified, willful',
        'health_issues': 'Breathing issues',
        'vaccinated': True,
        'spayed': False,
        'adopted': False,
        'image_url': 'https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=600&h=400&fit=crop'
    },
    {
        'name': 'Sadie',
        'breed': 'Corgi',
        'age': 1,
        'weight': '28 lbs',
        'location': 'San Diego',
        'temperament': 'Affectionate, bold, playful',
        'health_issues': 'None',
        'vaccinated': True,
        'spayed': False,
        'adopted': False,
        'image_url': 'https://images.unsplash.com/photo-1610003821637-b6d88a1ce74e?w=600&h=400&fit=crop'
    }
]

with app.app_context():
    for dog_data in sample_dogs:
        dog = Dog(**dog_data)
        DB.session.add(dog)
    
    DB.session.commit()
    print(f"Successfully created {len(sample_dogs)} dogs with unique images!")
