document.addEventListener('DOMContentLoaded', () => {
    // --- MAP INITIALIZATION ---
    const map = L.map('map').setView([8.03, 80.4], 9); // Centered on NWP
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // --- UI ELEMENTS ---
    const formContainer = document.getElementById('form-container');
    const form = document.getElementById('asset-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const showAllReportsBtn = document.getElementById('show-all-reports-btn');
    const hasVisitedSelect = document.getElementById('hasVisited');
    const visitDetailsSection = document.getElementById('visit-details-section');
    const feedbackSection = document.getElementById('feedback-section');

    // --- HELPER FUNCTION FOR CLICK EVENTS ---
    // This function will be called when a user clicks a valid asset
    const onAssetClick = (e, feature) => {
        // Stop the click from propagating to the map
        L.DomEvent.stopPropagation(e); 

        const placeName = feature.properties.name || feature.properties['name:en'] || 'Unnamed Location';
        const coords = e.latlng;
        const locationString = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;

        // Reset the form to its default state
        form.reset(); 
        handleVisitedChange();

        // Auto-fill the form fields
        document.getElementById('placeName').value = placeName;
        document.getElementById('location').value = locationString;

        // Show the form
        formContainer.classList.remove('hidden');
    };

    // --- LOAD GEOJSON DATA ---

    // 1. Load and display Province Boundary
    fetch('./data/NWP_Boundary.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                style: {
                    color: "#ff0000",
                    weight: 3,
                    opacity: 0.65,
                    fill: false, // Don't fill the province, just show the border
                    interactive: false // The boundary itself is not clickable
                }
            }).addTo(map);
            // Zoom the map to fit the province boundary
            map.fitBounds(L.geoJSON(data).getBounds());
        });

    // 2. Load and display POINT assets
    fetch('./data/point_boundry.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                onEachFeature: (feature, layer) => {
                    const displayName = feature.properties.name || feature.properties['name:en'] || 'Point of Interest';
                    layer.bindTooltip(displayName); // Show name on hover
                    layer.on('click', (e) => onAssetClick(e, feature)); // Handle click
                }
            }).addTo(map);
        });

    // 3. Load and display POLYGON assets
    fetch('./data/polygon_boundry.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                onEachFeature: (feature, layer) => {
                    const displayName = feature.properties.name || 'Area of Interest';
                    layer.bindTooltip(displayName); // Show name on hover
                    layer.on('click', (e) => onAssetClick(e, feature)); // Handle click
                }
            }).addTo(map);
        });
    
    // NOTE: The old map.on('click') listener has been removed.
    // Clicks on the empty map will now do nothing.

    // --- FORM LOGIC (No changes needed here) ---
    const handleVisitedChange = () => {
        if (hasVisitedSelect.value === 'Yes') {
            visitDetailsSection.style.display = 'block';
            feedbackSection.style.display = 'block';
        } else {
            visitDetailsSection.style.display = 'none';
            feedbackSection.style.display = 'none';
        }
    };

    hasVisitedSelect.addEventListener('change', handleVisitedChange);

    cancelBtn.addEventListener('click', () => {
        formContainer.classList.add('hidden');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (data.hasVisited === 'No') {
            delete data.visitFrequency;
            delete data.lastVisitDate;
            delete data.seasonOfVisit;
            delete data.overallSatisfaction;
            delete data.wouldRecommend;
            delete data.bestThing;
            delete data.improvements;
        }

        try {
            const response = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.msg || 'Failed to submit report');
            }

            alert('Asset report submitted successfully!');
            formContainer.classList.add('hidden');
        } catch (error) {
            console.error('Submission Error:', error);
            alert(`Submission Error: ${error.message}`);
        }
    });
    
    // --- NAVIGATION ---
    showAllReportsBtn.addEventListener('click', () => {
        window.location.href = 'reports.html';
    });
});