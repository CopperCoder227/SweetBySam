const clubsData = [];


const fetchClubsData = async () => {
    try {
        const response = await fetch('./data/clubs.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        clubsData.push(...data);
        renderClubs();
    } catch (error) {
        console.error('Error fetching clubs data:', error);
    }
};


const renderClubs = () => {
    const clubsContainer = document.getElementById('clubs-container');
    clubsContainer.innerHTML = '';


    clubsData.forEach(club => {
        const clubCard = createClubCard(club);
        clubsContainer.appendChild(clubCard);
    });
};


const createClubCard = (club) => {
    const card = document.createElement('div');
    card.classList.add('club-card');


    card.innerHTML = `
        <h3>${club.name}</h3>
        <p><strong>Coach/Teacher:</strong> ${club.teacher}</p>
        <p>${club.description}</p>
        <p><strong>Contact:</strong> ${club.contact}</p>
    `;


    return card;
};


document.addEventListener('DOMContentLoaded', () => {
    fetchClubsData();
});

