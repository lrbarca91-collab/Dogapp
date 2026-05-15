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
        'adopted': False
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
        'adopted': False
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
        'adopted': False
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
        'adopted': False
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
        'adopted': False
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
        'adopted': False
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
        'adopted': False
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
        'adopted': False
    }
]

with app.app_context():
    for dog_data in sample_dogs:
        dog = Dog(**dog_data)
        DB.session.add(dog)
    
    DB.session.commit()
    print(f"Successfully created {len(sample_dogs)} dogs!")
