document.addEventListener('DOMContentLoaded', () => {
    // ── Sidebar toggle ────────────────────────────────────────
    const menuIcon = document.getElementById('menuIcon');
    const sidebar = document.getElementById('sidebar');

    initCarousel();

    loadCategory('./JSON/cake.JSON', 'clubs-container', 'loading-cakes');
    loadCategory('./JSON/cookies.JSON', 'clubs-containerA', 'loading-cookies');
    loadCategory('./JSON/other.JSON', 'clubs-containerB', 'loading-other');

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

    // Correct containers
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

    function renderItems(items, container) {
        if (!container) return;

        container.innerHTML = "";

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "club-card";

            card.innerHTML = `
            <img src="${item.image}" class="club-image" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
        `;

            container.appendChild(card);
        });
    }


    function loadCategory(file, containerId, loadingId) {
        const loading = document.getElementById(loadingId);

        if (loading) loading.style.display = 'block';

        fetch(file)
            .then(res => res.ok ? res.json() : [])
            .then(items => {
                const container = document.getElementById(containerId);
                if (!container) return;

                container.innerHTML = '';

                items.forEach(item => {
                    const col = document.createElement('div');
                    col.className = 'col';

                    col.innerHTML = `
                    <div class="club-card">
                        <img src="${item.image}" class="club-image" alt="${item.name}">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                    </div>
                `;

                    container.appendChild(col);
                });

                // ✅ HIDE loading when done
                if (loading) loading.style.display = 'none';
            })
            .catch(() => {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '<p class="text-center">Failed to load items.</p>';
                }

                if (loading) loading.style.display = 'none';
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
