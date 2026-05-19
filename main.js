// 123MOVIES Premium Interactive Engine
console.log('123MOVIES Engine Loaded');

// Global Movie Database for search and autocomplete suggestion system
const MOVIE_DATABASE = [
    {
        title: "John Wick",
        url: "john-wick.html",
        image: "assets/jw1.jpg",
        category: "Action - 2014"
    },
    {
        title: "John Wick 2",
        url: "john-wick-2.html",
        image: "assets/jw2.jpg",
        category: "Action - 2017"
    },
    {
        title: "John Wick 3",
        url: "john-wick-3.html",
        image: "assets/jw3.jpg",
        category: "Action - 2019"
    },
    {
        title: "John Wick 4",
        url: "john-wick-4.html",
        image: "assets/jw4.jpg",
        category: "Action - 2023"
    },
    {
        title: "Michael",
        url: "michael.html",
        image: "assets/michael.jpg",
        category: "Music - Drama - 2026"
    },
    {
        title: "Swapped",
        url: "swapped.html",
        image: "assets/swapped.jpg",
        category: "Animation - Family - 2026"
    },
    {
        title: "The Godfather",
        url: "the-godfather.html",
        image: "assets/godfather.jpg",
        category: "Drama - Crime - 1972"
    },
    {
        title: "Shelter",
        url: "shelter.html",
        image: "assets/shelter.jpg",
        category: "Action - 2026"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Core DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const seeMoreBtn = document.querySelector('.btn-see-more');
    const movieGrid = document.getElementById('movieGrid');

    // Determine current page context
    const isHomepage = !!movieGrid;

    // Generate movie grid from MOVIE_DATABASE on homepage
    if (isHomepage) {
        movieGrid.innerHTML = '';
        MOVIE_DATABASE.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <img src="${movie.image}" alt="${movie.title}">
                <div class="info">
                    <h3>${movie.title}</h3>
                    <p>${movie.category}</p>
                </div>
            `;
            card.addEventListener('click', () => {
                window.location.href = movie.url;
            });
            movieGrid.appendChild(card);
        });
        
        // Add coming-soon placeholders
        for (let i = 0; i < 2; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'movie-card coming-soon';
            placeholder.innerHTML = `
                <div class="cover-placeholder">COMING SOON</div>
                <div class="info">
                    <h3>Coming Soon</h3>
                    <p>New Release</p>
                </div>
            `;
            movieGrid.appendChild(placeholder);
        }
    }

    // 2. Search Autocomplete & Filtering Logic
    if (searchInput) {
        // Instant key-up filtering & suggestion listing
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            
            if (isHomepage) {
                filterHomepageGrid(query);
            }

            renderSuggestions(query);
        });

        // Trigger search on clicking the search button
        if (searchButton) {
            searchButton.addEventListener('click', () => executeSearch());
        }

        // Trigger search on pressing Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeSearch();
            }
        });
    }

    // Handle suggestion rendering
    const renderSuggestions = (query) => {
        if (!searchSuggestions) return;
        searchSuggestions.innerHTML = '';

        if (!query) {
            searchSuggestions.classList.remove('active');
            return;
        }

        const matches = MOVIE_DATABASE.filter(movie => 
            movie.title.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            matches.forEach(movie => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `
                    <img src="${movie.image}" alt="${movie.title}">
                    <div class="suggestion-info">
                        <span class="suggestion-title">${movie.title}</span>
                        <span class="suggestion-meta">${movie.category}</span>
                    </div>
                `;
                item.addEventListener('click', () => {
                    window.location.href = movie.url;
                });
                searchSuggestions.appendChild(item);
            });
            searchSuggestions.classList.add('active');
        } else {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.cursor = 'default';
            item.innerHTML = `<span style="font-size: 0.85rem; color: #a0a0a0; padding: 0.2rem 0;">No movies found</span>`;
            searchSuggestions.appendChild(item);
            searchSuggestions.classList.add('active');
        }
    };

    // Close suggestions box when clicking outside search area
    document.addEventListener('click', (e) => {
        if (searchSuggestions && !searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });

    // Execute full search logic
    const executeSearch = () => {
        const query = searchInput.value.trim();
        if (!query) return;

        if (isHomepage) {
            filterHomepageGrid(query.toLowerCase());
            searchSuggestions.classList.remove('active');
        } else {
            // Redirect to home page with search query parameter
            window.location.href = `index.html?q=${encodeURIComponent(query)}`;
        }
    };

    // Filters movie items in real-time on the main page grid
    const filterHomepageGrid = (query) => {
        const cards = document.querySelectorAll('#movieGrid .movie-card');
        let visibleCount = 0;

        cards.forEach(card => {
            if (card.classList.contains('coming-soon')) {
                // Hide placeholders if searching
                card.style.display = query ? 'none' : 'flex';
                return;
            }

            const titleElement = card.querySelector('h3');
            if (titleElement) {
                const title = titleElement.textContent.toLowerCase();
                if (title.includes(query)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            }
        });

        // Toggle "See more" button visibility depending on search filter
        if (seeMoreBtn) {
            seeMoreBtn.style.display = query ? 'none' : 'block';
        }
    };

    // 3. Query Parameter Processing (Homepage Auto-Search)
    if (isHomepage) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlQuery = urlParams.get('q');
        if (urlQuery) {
            searchInput.value = urlQuery;
            filterHomepageGrid(urlQuery.toLowerCase());
        }
    }

    // 4. "See More" Button Logic
    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', () => {
            alert('Currently displaying all available movies!');
        });
    }

    // 5. High-end Adblocker Detection
    const detectAdBlock = () => {
        const bait = document.querySelector('.ad-zone-bait');
        const overlay = document.getElementById('adblockOverlay');
        const body = document.body;
        const mainContent = document.querySelector('.container') || document.querySelector('.player-layout');

        if (!bait || !overlay) return;

        const isBlocked = window.getComputedStyle(bait).getPropertyValue('display') === 'none' || 
                          bait.offsetHeight === 0;

        if (isBlocked) {
            overlay.classList.add('active');
            if (mainContent) mainContent.classList.add('content-blur-premium');
            body.style.overflow = 'hidden';
        }
    };

    // Multiple checks for robust detection
    setTimeout(detectAdBlock, 600);
    setTimeout(detectAdBlock, 2000);

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
});
