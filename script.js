document.addEventListener('DOMContentLoaded', () => {
    // ── Sidebar toggle ────────────────────────────────────────
    const menuIcon = document.getElementById('menuIcon');
    const sidebar = document.getElementById('sidebar');

    if (menuIcon && sidebar) {
        menuIcon.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            menuIcon.textContent = sidebar.classList.contains('open') ? '✕' : '☰';
        });

        document.querySelectorAll('.sidebar a').forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('open');
                menuIcon.textContent = '☰';
            });
        });
    }

    // ── Card loading only if container exists ─────────────────
    const container = document.getElementById('clubs-container');
    const loading = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');

    let searchIndex = [];

    const buyItems = [
        { name: "Baby Cake", description: "Adorable baby-themed cake perfect for celebrations.", image: "img/babyCake.jpeg" },
        { name: "Bird Cake", description: "Elegant bird-decorated cake for any occasion.", image: "img/birdCake.jpeg" },
        { name: "Chocolate Cake", description: "Rich and decadent chocolate cake.", image: "img/chocoCake.jpeg" },
        { name: "Flower Cake", description: "Beautiful floral cake design.", image: "img/flowerCake.jpeg" },
        { name: "Forever Cake", description: "Timeless cake for eternal love.", image: "img/forvCake.jpeg" },
        { name: "XO Cake", description: "Sweet cake with hugs and kisses.", image: "img/xoCake.jpeg" }
    ];

    const instaItems = [
        { name: "Baby Cake", description: "Adorable baby-themed cake perfect for celebrations.", image: "img/babyCake.jpeg" },
        { name: "Bird Cake", description: "Elegant bird-decorated cake for any occasion.", image: "img/birdCake.jpeg" },
        { name: "Chocolate Cake", description: "Rich and decadent chocolate cake.", image: "img/chocoCake.jpeg" },
        { name: "Flower Cake", description: "Beautiful floral cake design.", image: "img/flowerCake.jpeg" },
        { name: "Forever Cake", description: "Timeless cake for eternal love.", image: "img/forvCake.jpeg" },
        { name: "XO Cake", description: "Sweet cake with hugs and kisses.", image: "img/xoCake.jpeg" }
    ];

    function fetchAllDataFiles() {
        const sources = [
            { file: './data/clubbing.JSON', page: 'clubs.html' },
            { file: './data/fall.JSON', page: 'hayley-fsport.html' },
            { file: './data/winter.JSON', page: 'hayley-wsport.html' },
            { file: './data/spring.JSON', page: 'hayley-ssport.html' },
        ];

        return Promise.all(sources.map(s =>
            fetch(s.file)
                .then(r => r.ok ? r.json() : [])
                .then(arr => (Array.isArray(arr) ? arr.map(it => {
                    const name = String(it.name || '').trim();
                    // build a keyword set from name + description + any aliases
                    const desc = String(it.description || it.desc || '');
                    const alias = String(it.aliases || it.alias || '');
                    const words = (name + ' ' + desc + ' ' + alias).toLowerCase().match(/\b\w+\b/g) || [];
                    const keywords = Array.from(new Set([name.toLowerCase(), ...words]));
                    return { name, page: s.page, pageLabel: getPageLabel(s.page), data: it, keywords, isClubbing: s.page === 'clubs.html' };
                }) : []))
                .catch(() => [])
        )).then(results => {
            // flatten, drop empty names, and assign stable ids
            searchIndex = results.flat().filter(e => e.name).map((e, i) => ({ id: i, ...e }));
        });
    }

    function getCurrentPageFilename() {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1] || '';
    }

    function getPageLabel(page) {
        const map = {
            'index.html': 'Home',
            'insta.html': 'Creations',
            'buy.html': 'Purchase & Reviews',
        };
        return map[page] || (page ? page.replace('.html', '') : '');
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[s]));
    }

    // fetch the data index and render only the current page's cards
    fetchAllDataFiles().then(() => {
        const currentPage = getCurrentPageFilename();
        renderCardsForCurrentPage(currentPage);
    });

    // Render only cards that belong to the current page
    function renderCardsForCurrentPage(currentPage) {
        if (!container) return;
        if (loading) loading.style.display = 'none';
        container.innerHTML = '';

        let items = [];
        if (currentPage === 'buy.html') {
            items = buyItems.map(item => ({ name: item.name, page: 'buy.html', pageLabel: 'Purchase & Reviews', data: item, keywords: [], isClubbing: false }));
        } else if (currentPage === 'insta.html') {
            items = instaItems.map(item => ({ name: item.name, page: 'insta.html', pageLabel: 'Creations', data: item, keywords: [], isClubbing: false }));
        } else {
            items = (Array.isArray(searchIndex) ? searchIndex.filter(i => i.page === currentPage) : []);
        }

        if (!items.length) {
            container.innerHTML = '<p class="text-center lead">No items listed yet.</p>';
            return;
        }

        const sorted = items.slice().sort((a, b) => a.name.localeCompare(b.name));
        sorted.forEach(item => {
            const col = document.createElement('div');
            col.className = currentPage === 'index.html' ? 'col-12' : 'col';

            const roleLabel = item.isClubbing ? 'Teacher' : 'Coach';
            const descriptionHTML = item.isClubbing
                ? `<p><strong>Description:</strong> ${escapeHtml(item.data.description || 'No description available.')}</p>`
                : '';

            const imageHTML = item.data.image
                ? `<img src="${escapeHtml(item.data.image)}" alt="${escapeHtml(item.name || 'Unnamed')}" class="club-image">`
                : '';
            const showLocation = item.page !== 'clubs.html';

            if (currentPage === 'index.html') {
                col.innerHTML = `
    <div class="club-card home-card" data-page="${escapeHtml(item.page)}">
        ${imageHTML}
        <div class="card-text">
            <h3>${escapeHtml(item.name || 'Unnamed')}</h3>
            <p><strong>${roleLabel}:</strong> ${escapeHtml(item.data.teacher || item.data.coach || 'TBD')}</p>
            ${descriptionHTML}
            <p><strong>Contact:</strong> ${escapeHtml(item.data.contact || 'N/A')}</p>
            ${showLocation ? `<p><strong>Location:</strong> ${escapeHtml(item.data.location || 'TBD')}</p>` : ''}
        </div>
    </div>
`;
            } else if (currentPage === 'buy.html' || currentPage === 'insta.html') {
                const descriptionHTML = `<p>${escapeHtml(item.data.description || '')}</p>`;
                col.innerHTML = `
    <div class="club-card" data-page="${escapeHtml(item.page)}">
        ${imageHTML}
        <h3>${escapeHtml(item.name || 'Unnamed')}</h3>
        ${descriptionHTML}
    </div>
`;
            } else {
                col.innerHTML = `
    <div class="club-card" data-page="${escapeHtml(item.page)}">
        ${imageHTML}
        <h3>${escapeHtml(item.name || 'Unnamed')}</h3>
        <p><strong>${roleLabel}:</strong> ${escapeHtml(item.data.teacher || item.data.coach || 'TBD')}</p>
        ${descriptionHTML}
        <p><strong>Contact:</strong> ${escapeHtml(item.data.contact || 'N/A')}</p>
        ${showLocation ? `<p><strong>Location:</strong> ${escapeHtml(item.data.location || 'TBD')}</p>` : ''}
    </div>
`;
            }

            container.appendChild(col);
        });
    }
    // initialize banner carousel after cards (and other DOM) are ready
    initCarousel();
});


// ── Carousel ────────────────────────────────────────────────
// Configure the slides in the scrolling carousel.  Each entry may be either a
// simple string (path) or an object with extra styling options.  The
// `offsetY` and `offsetX` properties will be applied via CSS transform and can
// be used to raise/shift individual photos (e.g. raise the "babyCake" image).
const carouselImages = [
    // simple path: no special positioning
    { src: 'img/babyCake.jpeg', offsetY: '-200px' },      // example offset
    { src: 'img/birdCake.jpeg' },
    { src: 'img/chocoCake.jpeg', offsetY: '-200px' },
    { src: 'img/flowerCake.jpeg', offsetY: '-200px' },
    { src: 'img/forvCake.jpeg', offsetY: '-250px' },
    { src: 'img/xoCake.jpeg', offsetY: '-250px' },
    { src: 'img/chocolateCake.jpeg', offsetY: '-200px' },
    { src: 'img/fridgeCake.jpeg', offsetY: '-350px' }
];

function initCarousel() {
    // target the banner carousel specifically so we don't clobber the smaller cards
    const carouselInner = document.querySelector('#logoCarousel .carousel-inner');
    if (!carouselInner) return;

    // clear any existing slides
    carouselInner.innerHTML = '';

    carouselImages.forEach((item, index) => {
        // allow both string and object definitions for backward compatibility
        const imgPath = typeof item === 'string' ? item : item.src;
        const offsetX = item.offsetX || '0';
        const offsetY = item.offsetY || '0';

        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item' + (index === 0 ? ' active' : '');

        const img = document.createElement('img');
        img.src = imgPath;
        img.alt = `Slide ${index + 1}`;
        img.className = 'd-block w-100';
        img.style.objectFit = 'cover';

        // apply translation if offsets are provided
        if (offsetX !== '0' || offsetY !== '0') {
            img.style.transform = `translate(${offsetX}, ${offsetY})`;
        }

        carouselItem.appendChild(img);
        carouselInner.appendChild(carouselItem);
    });
}

document.addEventListener('DOMContentLoaded', initCarousel);

