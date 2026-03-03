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

    // ── Global search (indexes all data files for suggestions) ──
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    let searchIndex = [];

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

    function scoreMatch(item, q) {
        const name = item.name || '';
        const nl = name.toLowerCase();
        let score = 0;
        if (nl === q) score += 1000; // exact match
        if (nl.startsWith(q)) score += 200;
        if (nl.includes(q)) score += 50;

        // keyword scoring
        for (const kw of (item.keywords || [])) {
            if (kw === q) score += 400;
            else if (kw.startsWith(q)) score += 100;
            else if (kw.includes(q)) score += 10;
        }

        return score;
    }

    function getTopMatches(q, maxResults = 50) {
        if (!q) return [];
        q = q.toLowerCase();
        const scored = searchIndex.map(e => ({ ...e, score: scoreMatch(e, q) }))
            .filter(e => e.score > 0)
            .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

        return scored.slice(0, maxResults);
    }

    function clearSuggestions() {
        if (!searchDropdown) return;
        searchDropdown.style.display = 'none';
        searchDropdown.innerHTML = '';
    }

    function showSuggestions(matches) {
        if (!searchDropdown) return;
        if (!matches.length) {
            clearSuggestions();
            return;
        }

        // show all matches but constrain height so top 3 are visible with a scrollbar for the rest
        searchDropdown.innerHTML = matches.map((m, idx) =>
            `<div class="px-2 py-1 suggestion" data-idx="${idx}" style="cursor:pointer; text-align:left;">` +
            `${escapeHtml(m.name)} <small class="text-muted"> — ${escapeHtml(m.pageLabel || m.page.replace('.html', ''))}</small>` +
            `</div>`
        ).join('');

        searchDropdown.style.display = 'block';
        searchDropdown.style.maxHeight = '120px';
        searchDropdown.style.overflowY = 'auto';

        searchDropdown.querySelectorAll('.suggestion').forEach(el => {
            el.addEventListener('click', (ev) => {
                const idx = Number(el.dataset.idx);
                const item = matches[idx];
                if (!item) return;
                searchInput.value = item.name;
                clearSuggestions();
                handleSuggestionSelection(item);
            });
        });
    }

    function handleSuggestionSelection(item) {
        const currentPage = getCurrentPageFilename();
        // clear suggestions and input immediately when a selection is made
        clearSuggestions();
        if (searchInput) searchInput.value = '';

        if (currentPage && item.page && currentPage === item.page) {
            // same page — highlight the specific item
            highlightCardByName(item.name, item.page);
        } else {
            // navigate to the proper page and pass the query so it highlights on load
            window.location.href = item.page + '?q=' + encodeURIComponent(item.name);
        }
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[s]));
    }

    function getCurrentPageFilename() {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1] || '';
    }

    function getPageLabel(page) {
        const map = {
            'clubs.html': 'Clubs',
            'hayley-fsport.html': 'Fall Sports',
            'hayley-wsport.html': 'Winter Sports',
            'hayley-ssport.html': 'Spring Sports'
        };
        return map[page] || (page ? page.replace('.html', '') : '');
    }

    function unhighlightAll() {
        if (!container) return;
        container.querySelectorAll('.club-card.search-highlight').forEach(el => el.classList.remove('search-highlight'));
    }

    function highlightCardByName(name, page) {
        if (!container || !name) return;
        const q = String(name).trim().toLowerCase();
        if (!q) return;

        // unhighlight everything first
        unhighlightAll();

        const cards = Array.from(container.querySelectorAll('.club-card'));
        // prefer the card that matches both name and page (if page provided)
        const match = cards.find(card => {
            const h = card.querySelector('h3');
            if (!h) return false;
            const n = h.textContent.trim().toLowerCase();
            const p = card.dataset.page || '';
            if (page) return n === q && p === page;
            return n === q;
        }) || cards.find(card => {
            const h = card.querySelector('h3');
            return h && h.textContent.trim().toLowerCase() === q;
        });

        if (!match) return;
        match.classList.add('search-highlight');
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // remove highlight after 10 seconds (then fade back to default)
        setTimeout(() => {
            match.classList.remove('search-highlight');
        }, 10000);
    }

    // wire up search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = String(e.target.value || '').trim();
            if (!q) {
                clearSuggestions();
                return;
            }

            const matches = getTopMatches(q);
            showSuggestions(matches);
        });

        // hide dropdown on outside click
        document.addEventListener('click', (e) => {
            if (searchDropdown && !e.target.closest('.search-container')) {
                clearSuggestions();
            }
        });

        // handle Enter to accept first suggestion — fallback to top match if none shown
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const first = (searchDropdown && searchDropdown.querySelector('.suggestion')) || null;
                if (first) {
                    first.click();
                    e.preventDefault();
                    return;
                }

                // no dropdown suggestion selected — navigate/highlight top match if available
                const q = String(searchInput.value || '').trim();
                if (q) {
                    const top = getTopMatches(q, 1)[0];
                    if (top) {
                        handleSuggestionSelection(top);
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // fetch the data index for suggestions and render only the current page's cards
    fetchAllDataFiles().then(() => {
        const currentPage = getCurrentPageFilename();
        renderCardsForCurrentPage(currentPage);

        // If URL has ?q=... prefill and highlight
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q && searchInput) {
            searchInput.value = q;
            highlightCardByName(q, currentPage);
            // clear the search input once we've applied the highlight
            searchInput.value = '';
            clearSuggestions();
        }
    });

    // Render only cards that belong to the current page
    function renderCardsForCurrentPage(currentPage) {
        if (!container) return;
        if (loading) loading.style.display = 'none';
        container.innerHTML = '';

        const items = (Array.isArray(searchIndex) ? searchIndex.filter(i => i.page === currentPage) : []);

        if (!items.length) {
            container.innerHTML = '<p class="text-center lead">No items listed yet.</p>';
            return;
        }

        const sorted = items.slice().sort((a, b) => a.name.localeCompare(b.name));
        sorted.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col';

            const roleLabel = item.isClubbing ? 'Teacher' : 'Coach';
            const descriptionHTML = item.isClubbing
                ? `<p><strong>Description:</strong> ${escapeHtml(item.data.description || 'No description available.')}</p>`
                : '';

            const imageHTML = item.data.image
                ? `<img src="${escapeHtml(item.data.image)}" alt="${escapeHtml(item.name || 'Unnamed')}" class="club-image">`
                : '';
            const showLocation = item.page !== 'clubs.html';

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

            container.appendChild(col);
        });
    }
});


// ── Carousel ────────────────────────────────────────────────
const carouselImages = [
    // choose whichever images you prefer; the first will show initially
    'imgs/IMG_8539.jpeg',
    'imgs/IMG_8540.jpeg',
    'imgs/IMG_8541.jpeg',
    'imgs/IMG_8542.jpeg',
    'imgs/IMG_8543.jpeg',
    'imgs/IMG_8544.jpeg',
];

function initCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');
    if (!carouselInner) return;

    // clear any existing slides
    carouselInner.innerHTML = '';

    carouselImages.forEach((imagePath, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item' + (index === 0 ? ' active' : '');

        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = `Slide ${index + 1}`;
        img.className = 'd-block w-100';
        img.style.objectFit = 'cover';

        carouselItem.appendChild(img);
        carouselInner.appendChild(carouselItem);
    });
}

document.addEventListener('DOMContentLoaded', initCarousel);
