from database import DB

class Dog(DB.Model):
    __tablename__ = 'dogs'

    id = DB.Column(DB.Integer, primary_key=True)
    name = DB.Column(DB.String(100))
    breed = DB.Column(DB.String(100))
    age = DB.Column(DB.Integer)
    weight = DB.Column(DB.String(50))
    location = DB.Column(DB.String(100))
    temperament = DB.Column(DB.String(200))
    health_issues = DB.Column(DB.String(500))
    vaccinated = DB.Column(DB.Boolean)
    spayed = DB.Column(DB.Boolean)
    sponsorship_total = DB.Column(DB.Float, default=0)
    adopted = DB.Column(DB.Boolean, default=False)


class Sponsorship(DB.Model):
    __tablename__ = 'sponsorships'

    id = DB.Column(DB.Integer, primary_key=True)
    dog_id = DB.Column(DB.Integer)
    amount = DB.Column(DB.Float)
    sponsor_name = DB.Column(DB.String(100))


class AdoptionApplication(DB.Model):
    __tablename__ = 'adoption_applications'

    id = DB.Column(DB.Integer, primary_key=True)
    dog_id = DB.Column(DB.Integer)
    full_name = DB.Column(DB.String(100))
    age = DB.Column(DB.Integer)
    address = DB.Column(DB.String(300))
    email = DB.Column(DB.String(100))
    phone = DB.Column(DB.String(50))