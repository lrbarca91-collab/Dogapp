/**
 * Dogapp - Jest Unit Tests
 * Place this file at: Frontend/__tests__/app.test.js
 */

// ── Mock the DOM and globals before importing app.js ──────────────────
// We mock fetch so tests never hit a real API
global.fetch = jest.fn();

// Mock DOM elements app.js tries to access on load
document.body.innerHTML = `
    <div id="card-container"></div>
    <div id="sponsorModal" class="hidden">
        <input id="sponsorAmount" />
        <input id="sponsorName" />
        <div id="paypal-button-container"></div>
    </div>
    <div id="adoptionModal" class="hidden">
        <form id="adoptionForm">
            <input id="fullName" />
            <input id="age" />
            <input id="address" />
            <input id="email" />
            <input id="phone" />
        </form>
    </div>
`;

// Mock PayPal as undefined by default (not loaded)
global.paypal = undefined;

// ── Import app (runs DOMContentLoaded side effects) ───────────────────
require('../app.js');

// ─────────────────────────────────────────────────────────────────────
// 1. renderDogs()
// ─────────────────────────────────────────────────────────────────────
describe('renderDogs()', () => {

    beforeEach(() => {
        document.getElementById('card-container').innerHTML = '';
    });

    test('renders a card for each dog', () => {
        const dogs = [
            { id: 1, name: 'Rex', breed: 'Labrador', age: 3, weight: '30kg', location: 'London', temperament: 'Friendly', vaccinated: true, spayed: false, adopted: false, sponsorship_total: 0 },
            { id: 2, name: 'Bella', breed: 'Poodle', age: 5, weight: '20kg', location: 'Berlin', temperament: 'Calm', vaccinated: false, spayed: true, adopted: false, sponsorship_total: 0 }
        ];

        window.renderDogs(dogs);

        const cards = document.querySelectorAll('.card');
        expect(cards).toHaveLength(2);
    });

    test('shows dog name in card', () => {
        const dogs = [
            { id: 1, name: 'Rex', breed: 'Labrador', age: 3, weight: '30kg', location: 'London', temperament: 'Friendly', vaccinated: true, spayed: false, adopted: false, sponsorship_total: 0 }
        ];

        window.renderDogs(dogs);

        expect(document.getElementById('card-container').innerHTML).toContain('Rex');
    });

    test('shows empty message when no dogs', () => {
        window.renderDogs([]);

        expect(document.getElementById('card-container').innerHTML)
            .toContain('No dogs available for adoption at the moment.');
    });

    test('shows empty message when dogs is null', () => {
        window.renderDogs(null);

        expect(document.getElementById('card-container').innerHTML)
            .toContain('No dogs available for adoption at the moment.');
    });

    test('disables adopt button for already adopted dog', () => {
        const dogs = [
            { id: 1, name: 'Rex', breed: 'Labrador', age: 3, weight: '30kg', location: 'London', temperament: 'Friendly', vaccinated: true, spayed: false, adopted: true, sponsorship_total: 0 }
        ];

        window.renderDogs(dogs);

        const adoptBtn = document.querySelector('.adopt-btn');
        expect(adoptBtn.disabled).toBe(true);
    });

    test('shows sponsorship total when greater than 0', () => {
        const dogs = [
            { id: 1, name: 'Rex', breed: 'Labrador', age: 3, weight: '30kg', location: 'London', temperament: 'Friendly', vaccinated: true, spayed: false, adopted: false, sponsorship_total: 50.00 }
        ];

        window.renderDogs(dogs);

        expect(document.getElementById('card-container').innerHTML).toContain('50.00');
    });

    test('shows vaccinated checkmark when vaccinated is true', () => {
        const dogs = [
            { id: 1, name: 'Rex', breed: 'Labrador', age: 3, weight: '30kg', location: 'London', temperament: 'Friendly', vaccinated: true, spayed: false, adopted: false, sponsorship_total: 0 }
        ];

        window.renderDogs(dogs);

        expect(document.getElementById('card-container').innerHTML).toContain('✅ Yes');
    });
});

// ─────────────────────────────────────────────────────────────────────
// 2. showError()
// ─────────────────────────────────────────────────────────────────────
describe('showError()', () => {

    test('displays error message in card container', () => {
        window.showError('Failed to load dogs. Please refresh the page.');

        expect(document.getElementById('card-container').innerHTML)
            .toContain('Failed to load dogs. Please refresh the page.');
    });

    test('displays a try again button', () => {
        window.showError('Something went wrong');

        expect(document.getElementById('card-container').innerHTML)
            .toContain('Try Again');
    });
});

// ─────────────────────────────────────────────────────────────────────
// 3. openSponsorModal()
// ─────────────────────────────────────────────────────────────────────
describe('openSponsorModal()', () => {

    beforeEach(() => {
        // Seed dogsData via renderDogs so the module has data
        window.renderDogs([
            { id: 1, name: 'Rex', breed: 'Labrador', age: 3, weight: '30kg', location: 'London', temperament: 'Friendly', vaccinated: true, spayed: false, adopted: false, sponsorship_total: 0 }
        ]);
    });

    test('removes hidden class from sponsor modal', () => {
        window.openSponsorModal(1);

        expect(document.getElementById('sponsorModal').classList.contains('hidden')).toBe(false);
    });

    test('sets dog-id attribute on sponsor modal', () => {
        window.openSponsorModal(1);

        expect(document.getElementById('sponsorModal').getAttribute('data-dog-id')).toBe('1');
    });
});

// ─────────────────────────────────────────────────────────────────────
// 4. closeSponsorModal()
// ─────────────────────────────────────────────────────────────────────
describe('closeSponsorModal()', () => {

    test('adds hidden class back to sponsor modal', () => {
        document.getElementById('sponsorModal').classList.remove('hidden');

        window.closeSponsorModal();

        expect(document.getElementById('sponsorModal').classList.contains('hidden')).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────
// 5. openAdoptionModal()
// ─────────────────────────────────────────────────────────────────────
describe('openAdoptionModal()', () => {

    beforeEach(() => {
        window.renderDogs([
            { id: 1, name: 'Rex', breed: 'Labrador', age: 3, weight: '30kg', location: 'London', temperament: 'Friendly', vaccinated: true, spayed: false, adopted: false, sponsorship_total: 0 }
        ]);
    });

    test('removes hidden class from adoption modal', () => {
        window.openAdoptionModal(1);

        expect(document.getElementById('adoptionModal').classList.contains('hidden')).toBe(false);
    });

    test('sets dog-id attribute on adoption modal', () => {
        window.openAdoptionModal(1);

        expect(document.getElementById('adoptionModal').getAttribute('data-dog-id')).toBe('1');
    });
});

// ─────────────────────────────────────────────────────────────────────
// 6. closeAdoptionModal()
// ─────────────────────────────────────────────────────────────────────
describe('closeAdoptionModal()', () => {

    test('adds hidden class back to adoption modal', () => {
        document.getElementById('adoptionModal').classList.remove('hidden');

        window.closeAdoptionModal();

        expect(document.getElementById('adoptionModal').classList.contains('hidden')).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────
// 7. fetchDogs()
// ─────────────────────────────────────────────────────────────────────
describe('fetchDogs()', () => {

    beforeEach(() => {
        fetch.mockClear();
    });

    test('calls the /api/dogs endpoint', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await window.fetchDogs();

        expect(fetch).toHaveBeenCalledWith('/api/dogs');
    });

    test('shows error message when fetch fails', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500
        });

        await window.fetchDogs();

        expect(document.getElementById('card-container').innerHTML)
            .toContain('Failed to load dogs');
    });

    test('shows error message when network throws', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        await window.fetchDogs();

        expect(document.getElementById('card-container').innerHTML)
            .toContain('Failed to load dogs');
    });
});
