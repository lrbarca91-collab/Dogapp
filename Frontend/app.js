// API endpoint - uses nginx proxy (no CORS issues)
const API_URL = '/api';

// Dog data will come from backend, but keep local copy as fallback
let dogsData = [];
let currentSponsorDogId = null;

// Fetch dogs from backend when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchDogs();
    initPayPalButton();
});

// Fetch all dogs from backend
async function fetchDogs() {
    try {
        const response = await fetch(`${API_URL}/dogs`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        dogsData = await response.json();
        renderDogs(dogsData);
    } catch (error) {
        console.error('Error fetching dogs:', error);
        showError('Failed to load dogs. Please refresh the page.');
    }
}

// Render dog cards
function renderDogs(dogs) {
    const container = document.getElementById('card-container');
    
    if (!container) return;
    
    if (!dogs || dogs.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No dogs available for adoption at the moment.</p>';
        return;
    }
    
    container.innerHTML = '';

    dogs.forEach(dog => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <img src="${dog.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'}" alt="${dog.name}" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1'">
            
            <div class="card-content">
                <h2>${dog.name}</h2>
                <p><strong>Breed:</strong> ${dog.breed}</p>
                <p><strong>Age:</strong> ${dog.age} years</p>
                <p><strong>Weight:</strong> ${dog.weight}</p>
                <p><strong>Location:</strong> ${dog.location}</p>
                <p><strong>Temperament:</strong> ${dog.temperament}</p>
                <p><strong>Health:</strong> ${dog.health_issues || 'Healthy'}</p>
                <p><strong>Vaccinated:</strong> ${dog.vaccinated ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Spayed/Neutered:</strong> ${dog.spayed ? '✅ Yes' : '❌ No'}</p>
                ${dog.sponsorship_total > 0 ? `<p><strong>Sponsorship Raised:</strong> $${dog.sponsorship_total.toFixed(2)}</p>` : ''}
                ${dog.adopted ? '<p class="adopted-badge"><strong>❤️ Already Adopted</strong></p>' : ''}
                
                <div class="buttons">
                    <button class="adopt-btn" onclick="openAdoptionModal(${dog.id})" ${dog.adopted ? 'disabled style="opacity: 0.5;"' : ''}>
                        ${dog.adopted ? 'Already Adopted' : 'Adopt'}
                    </button>
                    
                    <button class="sponsor-btn" onclick="openSponsorModal(${dog.id})">
                        Sponsor ${dog.sponsorship_total > 0 ? `($${dog.sponsorship_total.toFixed(2)})` : ''}
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Show error message to user
function showError(message) {
    const container = document.getElementById('card-container');
    if (container) {
        container.innerHTML = `
            <div style="background: #ffebee; color: #c62828; padding: 20px; border-radius: 10px; text-align: center;">
                <p>❌ ${message}</p>
                <button onclick="fetchDogs()" style="margin-top: 10px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Modal Functions
function openSponsorModal(dogId) {
    const dog = dogsData.find(d => d.id === dogId);
    if (!dog) {
        showError('Dog not found');
        return;
    }
    
    currentSponsorDogId = dogId;
    document.getElementById('sponsorModal').setAttribute('data-dog-id', dogId);
    document.getElementById('sponsorModal').classList.remove('hidden');
    document.getElementById('sponsorAmount').value = '';
    document.getElementById('sponsorName').value = '';
}

function closeSponsorModal() {
    document.getElementById('sponsorModal').classList.add('hidden');
    document.getElementById('paypal-button-container').innerHTML = '';
    currentSponsorDogId = null;
}

// Initialize PayPal Button
function initPayPalButton() {
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK not loaded. Make sure PAYPAL_CLIENT_ID is set in index.html');
        return;
    }
}

// Render PayPal button when modal opens
function renderPayPalButton() {
    const amount = parseFloat(document.getElementById('sponsorAmount').value);
    const sponsorName = document.getElementById('sponsorName').value;
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (!sponsorName) {
        alert('Please enter your name');
        return;
    }
    
    if (typeof paypal === 'undefined') {
        alert('PayPal SDK not loaded. Please ensure PayPal is configured.');
        return;
    }
    
    // Clear previous buttons
    document.getElementById('paypal-button-container').innerHTML = '';
    
    paypal.Buttons({
        createOrder: async (data, actions) => {
            try {
                const response = await fetch(`${API_URL}/create-paypal-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amount,
                        dog_id: currentSponsorDogId
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to create order');
                }
                
                const orderData = await response.json();
                return orderData.order_id;
            } catch (error) {
                console.error('Error creating order:', error);
                alert('Failed to create PayPal order. Please try again.');
            }
        },
        onApprove: async (data, actions) => {
            try {
                const response = await fetch(`${API_URL}/capture-paypal-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        order_id: data.orderID,
                        dog_id: currentSponsorDogId,
                        sponsor_name: sponsorName,
                        amount: amount
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to capture order');
                }
                
                const result = await response.json();
                alert(`Thank you ${sponsorName}! Your $${amount} sponsorship for the dog has been processed successfully!`);
                closeSponsorModal();
                fetchDogs(); // Refresh the list to show updated sponsorship total
            } catch (error) {
                console.error('Error capturing order:', error);
                alert('Failed to complete the sponsorship. Please try again.');
            }
        },
        onError: (err) => {
            console.error('PayPal error:', err);
            alert('An error occurred during the payment process. Please try again.');
        }
    }).render('#paypal-button-container');
}

// Listen for changes in sponsorship amount and name
document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('sponsorAmount');
    const nameInput = document.getElementById('sponsorName');
    
    if (amountInput) {
        amountInput.addEventListener('change', renderPayPalButton);
    }
    if (nameInput) {
        nameInput.addEventListener('change', renderPayPalButton);
    }
});

function openAdoptionModal(dogId) {
    const dog = dogsData.find(d => d.id === dogId);
    if (!dog) {
        showError('Dog not found');
        return;
    }
    
    if (dog.adopted) {
        alert('This dog has already been adopted!');
        return;
    }
    
    document.getElementById('adoptionModal').setAttribute('data-dog-id', dogId);
    document.getElementById('adoptionModal').classList.remove('hidden');
}

function closeAdoptionModal() {
    document.getElementById('adoptionModal').classList.add('hidden');
    document.getElementById('adoptionForm').reset();
}

async function submitAdoption(event) {
    event.preventDefault();
    
    const modal = document.getElementById('adoptionModal');
    const dogId = parseInt(modal.getAttribute('data-dog-id'));
    
    const formData = {
        dog_id: dogId,
        full_name: document.getElementById('fullName').value,
        age: parseInt(document.getElementById('age').value),
        address: document.getElementById('address').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    if (!formData.full_name || !formData.age || !formData.address || !formData.email || !formData.phone) {
        alert('Please fill in all fields');
        return;
    }
    
    if (formData.age < 18) {
        alert('You must be at least 18 years old to adopt a dog');
        return;
    }
    
    if (!formData.email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/adopt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Thank you ${formData.full_name}! ${result.message}\nWe will contact you within 48 hours.`);
            closeAdoptionModal();
            fetchDogs();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Failed to submit application'}`);
        }
    } catch (error) {
        console.error('Error submitting adoption:', error);
        alert('Network error. Please try again.');
    }
}

// Make functions globally accessible
window.openSponsorModal = openSponsorModal;
window.closeSponsorModal = closeSponsorModal;
window.renderPayPalButton = renderPayPalButton;
window.openAdoptionModal = openAdoptionModal;
window.closeAdoptionModal = closeAdoptionModal;
window.submitAdoption = submitAdoption;
window.fetchDogs = fetchDogs;
