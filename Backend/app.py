from flask import Flask, jsonify, request
from flask_cors import CORS
from database import DB
from models import Dog, Sponsorship, AdoptionApplication

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@db:5432/dogs'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

DB.init_app(app)

with app.app_context():
    DB.create_all()


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
            'adopted': dog.adopted
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)