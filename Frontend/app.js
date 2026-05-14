const dogs = [
    {
        id: 1,
        name: "Max",
        breed: "Golden Retriever",
        age: 3,
        weight: "30kg",
        location: "Berlin",
        temperament: "Friendly",
        health: "Healthy",
        vaccinated: true,
        spayed: true,
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d"
    },
    {
        id: 2,
        name: "Bella",
        breed: "German Shepherd",
        age: 5,
        weight: "35kg",
        location: "Munich",
        temperament: "Protective",
        health: "Minor allergy",
        vaccinated: true,
        spayed: false,
        image: "https://images.unsplash.com/photo-1517849845537-4d257902454a"
    }
];

const container = document.getElementById('card-container');

function renderDogs() {
    container.innerHTML = '';

    dogs.forEach(dog => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <img src="${dog.image}" alt="${dog.name}">

            <div class="card-content">
                <h2>${dog.name}</h2>
                <p><strong>Breed:</strong> ${dog.breed}</p>
                <p><strong>Age:</strong> ${dog.age}</p>
                <p><strong>Weight:</strong> ${dog.weight}</p>
                <p><strong>Location:</strong> ${dog.location}</p>
                <p><strong>Temperament:</strong> ${dog.temperament}</p>
                <p><strong>Health:</strong> ${dog.health}</p>

                <div class="buttons">
                    <button class="adopt-btn" onclick="openAdoptionModal(${dog.id})">
                        Adopt
                    </button>

                    <button class="sponsor-btn" onclick="openSponsorModal(${dog.id})">
                        Sponsor
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

renderDogs();

function openSponsorModal(dogId) {
    document.getElementById('sponsorModal').classList.remove('hidden');
}

function closeSponsorModal() {
    document.getElementById('sponsorModal').classList.add('hidden');
}

function openAdoptionModal(dogId) {
    document.getElementById('adoptionModal').classList.remove('hidden');
}

function closeAdoptionModal() {
    document.getElementById('adoptionModal').classList.add('hidden');
});