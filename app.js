/**
 * APPLICATION LOGIC - STANDALONE VERSION
 * Handles searching and rendering using local data.js
 */

// DOM Elements
const mainContent = document.getElementById('main-content');
const btnHome = document.getElementById('btn-home');
const btnSearch = document.getElementById('btn-search');
const btnCompare = document.getElementById('btn-compare');
const btnAbout = document.getElementById('btn-about');
const navLogo = document.getElementById('nav-home');

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    showHome();
});

// Event Listeners
btnHome.addEventListener('click', showHome);
btnSearch.addEventListener('click', showSearch);
btnCompare.addEventListener('click', showCompare);
btnAbout.addEventListener('click', showAbout);
navLogo.addEventListener('click', showHome);

/**
 * UTILITY: Shorten Course Names
 */
function shortenCourseNames(coursesString) {
    if (!coursesString || coursesString === 'Contact institution for course list.') return coursesString;
    
    const mapping = {
        'Computer Science and Engineering': 'CSE',
        'Computer Science': 'CS',
        'Mechanical Engineering': 'ME',
        'Electrical Engineering': 'EE',
        'Electronics and Communication Engineering': 'ECE',
        'Civil Engineering': 'CE',
        'Chemical Engineering': 'ChE',
        'Information Technology': 'IT',
        'Biotechnology Engineering': 'BT',
        'Biotechnology': 'BT',
        'Electronics and Instrumentation Engineering': 'EIE',
        'Metallurgical and Materials Engineering': 'MME',
        'Mining Engineering': 'Mining',
        'Ceramic Engineering': 'Ceramic',
        'Biomedical Engineering': 'BME',
        'Instrumentation and Control Engineering': 'ICE',
        'Electrical and Electronics Engineering': 'EEE',
        'Aeronautical Engineering': 'Aero',
        'Automobile Engineering': 'Auto',
        'Industrial Design': 'ID',
        'Food Process Engineering': 'FPE',
        'Production Engineering': 'PE',
        'Electronics System and Communication': 'ESC',
        'Information Security': 'IS',
        'Machine Design and Analysis': 'MDA',
        'Power Electronics and Drives': 'PED',
        'Power Systems Engineering': 'PSE'
    };

    return coursesString.split(',').map(course => {
        let trimmedCourse = course.trim();
        for (const [full, short] of Object.entries(mapping)) {
            if (trimmedCourse.includes(full)) {
                return trimmedCourse.replace(full, short);
            }
        }
        return trimmedCourse;
    }).join(', ');
}

/**
 * VIEW: HOME
 */
function showHome() {
    mainContent.innerHTML = `
        <section class="hero">
            <div class="container">
                <h1>Find the Best Engineering Colleges in India</h1>
                <p>Search over 5,000+ colleges by name, city, or <strong>specific courses</strong> (e.g. Mechanical, Data Science).</p>
                <div class="search-box">
                    <input type="text" id="home-search" placeholder="Search by college, city, or course (e.g. Civil Engineering)...">
                    <button class="search-btn" id="home-search-btn">Search</button>
                </div>
            </div>
        </section>

        <section class="container" style="padding: 40px 0; border-bottom: 1px solid var(--border);">
            <h2 style="text-align: center; margin-bottom: 30px; font-size: 1.5rem;">Quick Search by Course</h2>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                ${['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Electronics', 'Chemical', 'Biotechnology', 'Aeronautical'].map(course => 
                    `<span class="tag" style="padding: 10px 20px; cursor: pointer; border: 1px solid var(--primary); color: var(--primary); background: transparent;" onclick="handleQuickSearch('${course}')">${course}</span>`
                ).join('')}
            </div>
        </section>

        <section class="container" style="padding: 60px 0;">
            <h2 style="text-align: center; margin-bottom: 40px;">Featured Colleges</h2>
            <div class="results-grid" id="featured-grid">
                <!-- Top rated colleges will be injected here -->
            </div>
            <div style="text-align: center; margin-top: 40px;">
                <button class="search-btn" onclick="showSearch()">View All Colleges</button>
            </div>
        </section>
    `;

    // Inject some featured colleges (top 6)
    const featuredGrid = document.getElementById('featured-grid');
    const featured = collegeData.slice(0, 6);
    featured.forEach(college => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-content">
                <h3>${college.college_name}</h3>
                <p class="location">📍 ${college.city}, ${college.state}</p>
                <div class="tag-container" style="margin-top: 15px;">
                    <span class="tag">${college.college_type}</span>
                </div>
                <div style="margin-top: 15px; color: var(--primary); font-weight: 600; font-size: 0.9rem;">View Details →</div>
            </div>
            <div class="card-sidebar">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Quick Info</div>
                <div class="price">₹${Math.round(college.average_fees || 0).toLocaleString()} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">/ year</span></div>
                <div class="rating">⭐ ${college.rating || 'N/A'}</div>
                <a href="https://www.google.com/search?q=${encodeURIComponent(college.college_name + ' ' + college.city + ' contact number')}" 
                   target="_blank" class="contact-pill" onclick="event.stopPropagation()">
                   📞 Search Contact Info
                </a>
            </div>
        `;
        card.addEventListener('click', () => showDetails(college.college_name));
        featuredGrid.appendChild(card);
    });

    document.getElementById('home-search-btn').addEventListener('click', () => {
        const query = document.getElementById('home-search').value;
        showSearch(query);
    });

    document.getElementById('home-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') showSearch(e.target.value);
    });
}

/**
 * VIEW: SEARCH RESULTS
 */
function showSearch(query = "") {
    const searchQuery = (typeof query === 'string') ? query : "";
    
    mainContent.innerHTML = `
        <div class="container" style="padding-top: 40px;">
            <div class="search-box" style="margin-bottom: 20px; box-shadow: none; border: 1px solid #cbd5e1;">
                <input type="text" id="inner-search" placeholder="Find college by name or course name..." value="${searchQuery}">
                <button class="search-btn" id="inner-search-btn">Search</button>
            </div>
            
            <div class="search-layout">
                <!-- Sidebar -->
                <aside class="filter-sidebar">
                    <!-- Tuition Fee Section -->
                    <div class="filter-section">
                        <div class="filter-header" onclick="toggleFilter(this)">
                            <span>💰 Tuition Fee (Annual)</span>
                            <i>▼</i>
                        </div>
                        <div class="filter-content">
                            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Amount in INR</p>
                            <div class="fee-inputs">
                                <div class="fee-field">
                                    <label>Min</label>
                                    <input type="number" id="fee-min" placeholder="0" value="0">
                                </div>
                                <div class="fee-field">
                                    <label>Max</label>
                                    <input type="number" id="fee-max" placeholder="No Max">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Institution Type -->
                    <div class="filter-section">
                        <div class="filter-header" onclick="toggleFilter(this)">
                            <span>🏛 Institution Type</span>
                            <i>▼</i>
                        </div>
                        <div class="filter-content">
                            <label class="filter-option">
                                <span class="option-label"><input type="checkbox" class="type-filter" value="Public/Government"> Public/Govt</span>
                            </label>
                            <label class="filter-option">
                                <span class="option-label"><input type="checkbox" class="type-filter" value="Private"> Private</span>
                            </label>
                        </div>
                    </div>

                    <!-- Rating -->
                    <div class="filter-section">
                        <div class="filter-header" onclick="toggleFilter(this)">
                            <span>⭐ Rating</span>
                            <i>▼</i>
                        </div>
                        <div class="filter-content">
                            ${[4, 3, 2].map(r => `
                                <label class="filter-option">
                                    <span class="option-label"><input type="checkbox" class="rating-filter" value="${r}"> ${r}+ Stars</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- State -->
                    <div class="filter-section">
                        <div class="filter-header" onclick="toggleFilter(this)">
                            <span>📍 Top States</span>
                            <i>▼</i>
                        </div>
                        <div class="filter-content" style="max-height: 200px; overflow-y: auto;">
                            ${['Maharashtra', 'Tamil Nadu', 'Delhi', 'Karnataka', 'Telangana', 'Uttar Pradesh', 'Gujarat'].map(s => `
                                <label class="filter-option">
                                    <span class="option-label"><input type="checkbox" class="state-filter" value="${s}"> ${s}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </aside>

                <!-- Results Area -->
                <section>
                    <h2 id="search-title" style="margin-bottom: 20px;">Colleges in India</h2>
                    <div class="results-grid" id="results-grid">
                        <!-- Cards injected here -->
                    </div>
                </section>
            </div>
        </div>
    `;

    const grid = document.getElementById('results-grid');
    const title = document.getElementById('search-title');

    const renderResults = () => {
        const query = document.getElementById('inner-search').value.toLowerCase();
        const minFee = parseInt(document.getElementById('fee-min').value) || 0;
        const maxFee = parseInt(document.getElementById('fee-max').value) || Infinity;
        
        const selectedTypes = Array.from(document.querySelectorAll('.type-filter:checked')).map(cb => cb.value);
        const selectedRatings = Array.from(document.querySelectorAll('.rating-filter:checked')).map(cb => parseInt(cb.value));
        const selectedStates = Array.from(document.querySelectorAll('.state-filter:checked')).map(cb => cb.value);

        const filtered = collegeData.filter(c => {
            const matchesQuery = !query || 
                (c.college_name || "").toLowerCase().includes(query) || 
                (c.city || "").toLowerCase().includes(query) ||
                (c.state || "").toLowerCase().includes(query) ||
                (c.courses && c.courses.toLowerCase().includes(query));

            const fee = c.average_fees || 0;
            const matchesFee = fee >= minFee && fee <= maxFee;

            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(c.college_type);
            const matchesRating = selectedRatings.length === 0 || selectedRatings.some(r => (c.rating || 0) >= r);
            const matchesState = selectedStates.length === 0 || selectedStates.includes(c.state);

            return matchesQuery && matchesFee && matchesType && matchesRating && matchesState;
        }).slice(0, 80);

        grid.innerHTML = "";
        title.innerText = `${filtered.length} results found`;

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">No colleges found matching these filters.</div>`;
            return;
        }

        filtered.forEach(college => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-content">
                    <h3>${college.college_name}</h3>
                    <p class="location">📍 ${college.city}, ${college.state}</p>
                    <div class="tag-container" style="margin-top: 15px;">
                        <span class="tag">${college.college_type}</span>
                    </div>
                    <div style="margin-top: 15px; color: var(--primary); font-weight: 600; font-size: 0.9rem;">View Details →</div>
                </div>
                <div class="card-sidebar">
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Quick Info</div>
                    <div class="price">₹${Math.round(college.average_fees || 0).toLocaleString()} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">/ year</span></div>
                    <div class="rating">⭐ ${college.rating || 'N/A'}</div>
                    <a href="https://www.google.com/search?q=${encodeURIComponent(college.college_name + ' ' + college.city + ' contact number')}" 
                       target="_blank" class="contact-pill" onclick="event.stopPropagation()">
                       📞 Search Contact Info
                    </a>
                </div>
            `;
            card.addEventListener('click', () => showDetails(college.college_name));
            grid.appendChild(card);
        });
    };

    // Initial render
    renderResults();

    // Event listeners for filters
    document.getElementById('inner-search-btn').addEventListener('click', renderResults);
    document.getElementById('inner-search').addEventListener('input', renderResults);
    document.getElementById('fee-min').addEventListener('input', renderResults);
    document.getElementById('fee-max').addEventListener('input', renderResults);
    
    document.querySelectorAll('.type-filter, .rating-filter, .state-filter').forEach(cb => {
        cb.addEventListener('change', renderResults);
    });
}

/**
 * TOGGLE FILTER COLLAPSE
 */
function toggleFilter(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('i');
    content.classList.toggle('collapsed');
    icon.style.transform = content.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
}

/**
 * VIEW: COLLEGE DETAILS
 */
function showDetails(collegeName) {
    const college = collegeData.find(c => c.college_name === collegeName);
    if (!college) return;

    mainContent.innerHTML = `
        <div class="container details-view">
            <div class="back-btn" id="back-to-results">← Back to Search Results</div>
            
            <header class="details-header">
                <h1 style="font-size: 2.2rem; margin-bottom: 10px;">${college.college_name}</h1>
                <p style="font-size: 1.1rem; color: #64748b;">📍 ${college.city}, ${college.state}, ${college.country}</p>
            </header>

            <div class="details-body">
                <div class="main-info">
                    <div class="info-box">
                        <h2>Institution Profile</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <p><strong>Established:</strong> ${college.established_year || 'N/A'}</p>
                            <p><strong>Type:</strong> ${college.college_type || 'N/A'}</p>
                            <p><strong>Genders:</strong> ${college.genders_accepted || 'N/A'}</p>
                            <p><strong>Campus:</strong> ${college.campus_size || 'N/A'}</p>
                        </div>
                    </div>

                    <div class="info-box">
                        <h2>Courses Offered</h2>
                        <p style="color: #475569; font-size: 0.95rem; line-height: 1.8;">
                            ${shortenCourseNames(college.courses)}
                        </p>
                    </div>

                    <div class="info-box">
                        <h2>Facilities</h2>
                        <div class="tag-container">
                            ${college.facilities ? college.facilities.split(',').map(f => `<span class="tag">${f.trim()}</span>`).join('') : 'N/A'}
                        </div>
                    </div>
                </div>

                <aside class="sidebar-info">
                    <div class="info-box" style="background: var(--primary); color: white;">
                        <h2 style="color: white; font-size: 1.2rem;">Quick Info</h2>
                        <div class="contact-item">
                            <span class="contact-label" style="color: #bfdbfe;">Avg Fees:</span>
                            <span>₹${college.average_fees ? Math.round(college.average_fees).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div class="contact-item">
                            <span class="contact-label" style="color: #bfdbfe;">Rating:</span>
                            <span>⭐ ${college.rating || 'N/A'}</span>
                        </div>

                        <div style="margin-top: 20px;">
                            <a href="https://www.google.com/search?q=${encodeURIComponent(college.college_name + ' ' + college.city + ' contact number')}" 
                               target="_blank" 
                               style="display: block; background: white; color: var(--primary); text-align: center; padding: 10px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 0.9rem;">
                               📞 Search Contact Info
                            </a>
                            <p style="font-size: 0.7rem; margin-top: 8px; color: #dbeafe; text-align: center;">Click to find latest phone & email on Google</p>
                        </div>
                    </div>
                    <div class="info-box">
                        <h2 style="font-size: 1.2rem;">University Affiliation</h2>
                        <p>${college.university || 'Independent / Deemed Institution'}</p>
                    </div>
                </aside>
            </div>
        </div>
    `;

    document.getElementById('back-to-results').addEventListener('click', () => showSearch());
    window.scrollTo(0, 0);
}

/**
 * HELPERS
 */
function handleQuickSearch(query) {
    showSearch(query);
}

/**
 * VIEW: COMPARE COLLEGES
 */
function showCompare() {
    mainContent.innerHTML = `
        <div class="container" style="padding: 60px 0;">
            <h1 style="text-align: center; margin-bottom: 40px;">Compare Colleges</h1>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
                <div class="info-box">
                    <h3>Select College 1</h3>
                    <select id="compare-1" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); margin-top: 10px;">
                        <option value="">Choose a college...</option>
                        ${collegeData.slice(0, 100).map(c => `<option value="${c.college_name}">${c.college_name}</option>`).join('')}
                    </select>
                </div>
                <div class="info-box">
                    <h3>Select College 2</h3>
                    <select id="compare-2" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border); margin-top: 10px;">
                        <option value="">Choose a college...</option>
                        ${collegeData.slice(0, 100).map(c => `<option value="${c.college_name}">${c.college_name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div id="compare-results" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div id="col-1-details"></div>
                <div id="col-2-details"></div>
            </div>
        </div>
    `;

    const select1 = document.getElementById('compare-1');
    const select2 = document.getElementById('compare-2');
    const res1 = document.getElementById('col-1-details');
    const res2 = document.getElementById('col-2-details');

    const renderCompare = (collegeName, container) => {
        const college = collegeData.find(c => c.college_name === collegeName);
        if (!college) {
            container.innerHTML = "";
            return;
        }
        container.innerHTML = `
            <div class="info-box" style="height: 100%;">
                <h2 style="font-size: 1.2rem;">${college.college_name}</h2>
                <p><strong>📍 Location:</strong> ${college.city}, ${college.state}</p>
                <p><strong>🏛 Type:</strong> ${college.college_type}</p>
                <p><strong>⭐ Rating:</strong> ${college.rating || 'N/A'}</p>
                <p><strong>💰 Avg Fees:</strong> ₹${Math.round(college.average_fees || 0).toLocaleString()} / year</p>
                <p><strong>📅 Estd:</strong> ${college.established_year || 'N/A'}</p>
                <div style="margin-top: 20px;">
                    <strong>Available Courses:</strong>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">${shortenCourseNames(college.courses).substring(0, 200)}...</p>
                </div>
            </div>
        `;
    };

    select1.addEventListener('change', (e) => renderCompare(e.target.value, res1));
    select2.addEventListener('change', (e) => renderCompare(e.target.value, res2));
}

/**
 * VIEW: ABOUT US
 */
function showAbout() {
    mainContent.innerHTML = `
        <div class="container" style="padding: 80px 0; max-width: 800px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 30px;">About CollegeFinder</h1>
            <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 20px;">
                CollegeFinder is India's most comprehensive platform for aspiring engineering students. We help you navigate the complex landscape of higher education by providing accurate, up-to-date information on over 5,000 colleges across the country.
            </p>
            <div class="info-box">
                <h2>Our Mission</h2>
                <p>To empower students with transparent data, enabling them to make the most informed decisions about their academic future.</p>
            </div>
            <div class="info-box">
                <h2>What We Offer</h2>
                <ul style="padding-left: 20px; line-height: 2;">
                    <li>Detailed profiles of 5,000+ Engineering Colleges</li>
                    <li>Advanced filtering by fees, location, and rating</li>
                    <li>Side-by-side college comparison tool</li>
                    <li>Comprehensive course lists and facility details</li>
                </ul>
            </div>
        </div>
    `;
}
