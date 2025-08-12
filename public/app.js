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

    // --- HELPER FUNCTION FOR FORM ---
    // This function will be called when a user clicks a valid asset
    const onAssetClick = (e, feature) => {
        // Stop the click from propagating to the map, which might close other popups
        L.DomEvent.stopPropagation(e);

        const placeName = feature.properties.name || feature.properties['name:en'] || 'Unnamed Location';
        const coords = e.latlng;
        const locationString = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;

        // Reset the form to its default state
        form.reset();
        handleVisitedChange();

        // Auto-fill the form fields with data from the clicked asset
        document.getElementById('placeName').value = placeName;
        document.getElementById('location').value = locationString;

        // Show the form
        formContainer.classList.remove('hidden');
    };

    // --- LOAD GEOJSON DATA ---

    // 1. Load and display the VISIBLE Province Boundary
    fetch('./data/NWP_Boundary.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                style: {
                    color: "#ff0000",
                    weight: 3,
                    opacity: 0.7,
                    fill: false,
                    interactive: false // The boundary itself is not clickable
                }
            }).addTo(map);
            // Zoom the map to fit the province boundary
            map.fitBounds(L.geoJSON(data).getBounds());
        });

    // 2. Load and display POINT assets as INVISIBLE, clickable layers
    fetch('./data/point_boundry.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                // This function turns each point into an invisible circle
                pointToLayer: (feature, latlng) => {
                    return L.circleMarker(latlng, {
                        radius: 8, // A small, clickable radius around the point
                        fillOpacity: 0,
                        stroke: false // No visible border
                    });
                },
                onEachFeature: (feature, layer) => {
                    const displayName = feature.properties.name || feature.properties['name:en'] || 'Point of Interest';
                    // bindTooltip handles hover events automatically
                    layer.bindTooltip(displayName);
                    // Add the click event listener
                    layer.on('click', (e) => onAssetClick(e, feature));
                }
            }).addTo(map);
        });

    // 3. Load and display POLYGON assets as INVISIBLE, clickable layers
    fetch('./data/polygon_boundry.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                // This style makes the polygon areas invisible
                style: {
                    fillOpacity: 0,
                    stroke: false // This also removes the duplicate inner boundary line
                },
                onEachFeature: (feature, layer) => {
                    const displayName = feature.properties.name || 'Area of Interest';
                    layer.bindTooltip(displayName);
                    layer.on('click', (e) => onAssetClick(e, feature));
                }
            }).addTo(map);
        });

    // Clicks on the empty map will now do nothing because there's no layer there.

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

        // Clear non-applicable fields if user hasn't visited
        if (data.hasVisited === 'No') {
            delete data.visitFrequency;
            // Ensure empty date is not sent as an empty string, which can cause issues
            if (!data.lastVisitDate) delete data.lastVisitDate;
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

            // If the server response is not "ok" (e.g., 400, 405, 500 error)
            if (!response.ok) {
                // Try to get a detailed error message from the server's JSON response
                const errorData = await response.json().catch(() => {
                    // If the response isn't JSON, use the status text
                    throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
                });
                // Throw an error with the specific message from the server
                throw new Error(errorData.msg || 'Failed to submit report. Please try again.');
            }

            // If the submission was successful
            alert('Asset report submitted successfully!');
            formContainer.classList.add('hidden');

        } catch (error) {
            // Catch any error from the try block and display it in the alert
            console.error('Submission Error:', error);
            alert(`Submission Error: ${error.message}`);
        }
    });
    
    // --- NAVIGATION ---
    showAllReportsBtn.addEventListener('click', () => {
        window.location.href = 'reports.html';
    });
});