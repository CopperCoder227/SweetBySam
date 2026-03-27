// Manage reviews in local storage
let reviews = JSON.parse(localStorage.getItem('sweetBySamReviews')) || [];
let selectedRating = 0;
let filterStars = 'all';

// Dynamic form fields based on dessert type
const formConfigs = {
    cake: [
        { label: 'Name', name: 'cakeName', type: 'text', placeholder: 'Enter cake name' },
        { label: 'Description', name: 'description', type: 'textarea', placeholder: 'Describe your cake' },
        { label: 'Size', name: 'cakeSize', type: 'select', options: ['6"', '8"', '10"', '12"'] }
    ],
    cookies: [
        { label: 'Amount', name: 'cookieAmount', type: 'select', options: ['1 dozen', '2 dozen', '3 dozen', 'Custom'] },
        { label: 'Type of Cookie', name: 'cookieType', type: 'select', options: ['Chocolate Chip', 'Sugar', 'Oatmeal', 'Peanut Butter', 'Mixed'] }
    ],
    brownies: [
        { label: 'Amount', name: 'brownieAmount', type: 'select', options: ['1 box', '2 boxes', '3 boxes', 'Custom'] }
    ],
    other: [
        { label: 'Dessert Name', name: 'dessertName', type: 'text', placeholder: 'What would you like?' },
        { label: 'Description', name: 'specialDescription', type: 'textarea', placeholder: 'Tell us what you want' }
    ]
};

// Update form fields based on dessert type selection
document.getElementById('dessertType').addEventListener('change', (e) => {
    const type = e.target.value;
    const container = document.getElementById('dynamicFields');
    container.innerHTML = '';

    if (!type) return;

    const fields = formConfigs[type];
    fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = field.label;
        div.appendChild(label);

        if (field.type === 'textarea') {
            const textarea = document.createElement('textarea');
            textarea.name = field.name;
            textarea.placeholder = field.placeholder || '';
            textarea.required = true;
            div.appendChild(textarea);
        } else if (field.type === 'select') {
            const select = document.createElement('select');
            select.name = field.name;
            select.required = true;
            select.innerHTML = '<option value="">-- Choose --</option>';
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                select.appendChild(option);
            });
            div.appendChild(select);
        } else {
            const input = document.createElement('input');
            input.type = field.type;
            input.name = field.name;
            input.placeholder = field.placeholder || '';
            input.required = true;
            div.appendChild(input);
        }

        container.appendChild(div);
    });
});

// Star rating for leaving review
document.querySelectorAll('#leaveReviewStars .star').forEach(star => {
    star.addEventListener('click', (e) => {
        selectedRating = parseInt(e.target.dataset.value);
        document.querySelectorAll('#leaveReviewStars .star').forEach(s => s.classList.remove('active'));
        for (let i = 0; i < selectedRating; i++) {
            document.querySelectorAll('#leaveReviewStars .star')[i].classList.add('active');
        }
    });
});

// Submit review
document.getElementById('submitReview').addEventListener('click', () => {
    const reviewText = document.getElementById('reviewText').value.trim();
    if (!selectedRating || !reviewText) {
        alert('Please select a rating and enter a review.');
        return;
    }

    reviews.push({
        rating: selectedRating,
        text: reviewText,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem('sweetBySamReviews', JSON.stringify(reviews));
    document.getElementById('reviewText').value = '';
    selectedRating = 0;
    document.querySelectorAll('#leaveReviewStars .star').forEach(s => s.classList.remove('active'));

    displayReviews();
});

// Display reviews based on filter
function displayReviews() {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';

    const filteredReviews = filterStars === 'all' ? reviews : reviews.filter(r => r.rating === parseInt(filterStars));

    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = '<p style="text-align: center; color: #999;">No reviews yet.</p>';
        return;
    }

    filteredReviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';

        const stars = '⭐'.repeat(review.rating);
        reviewCard.innerHTML = `
                    <div class="review-stars">${stars} (${review.rating}/5)</div>
                    <div class="review-text">${review.text}</div>
                    <small style="color: #999;">${review.date}</small>
                `;

        reviewsList.appendChild(reviewCard);
    });
}

// Star filter buttons
document.querySelectorAll('.star-filter button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.star-filter button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        filterStars = e.target.dataset.stars;
        displayReviews();
    });
});

// Form submission
document.getElementById('purchaseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your order! Check your email for confirmation.');
    document.getElementById('purchaseForm').reset();
    document.getElementById('dessertType').value = '';
    document.getElementById('dynamicFields').innerHTML = '';
});

// Initialize reviews display on page load
displayReviews();