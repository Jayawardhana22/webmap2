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

    // --- APP STATE AND DATA STORAGE ---
    let allAssets = []; // This will hold all features from both GeoJSON files
    const hoverTooltip = L.tooltip(); // Create a single tooltip instance for hovering

    // --- DATA LOADING ---
    const loadData = async () => {
        try {
            // Fetch all data files at the same time for efficiency
            const [nwpResponse, pointsResponse, polygonsResponse] = await Promise.all([
                fetch('./data/NWP_Boundary.geojson'),
                fetch('./data/point_boundry.geojson'),
                fetch('./data/polygon_boundry.geojson')
            ]);

            const nwpData = await nwpResponse.json();
            const pointsData = await pointsResponse.json();
            const polygonsData = await polygonsResponse.json();

            // 1. Display the NWP Boundary
            L.geoJSON(nwpData, {
                style: { color: "#ff0000", weight: 3, opacity: 0.65, fill: false, interactive: false },
            }).addTo(map);
            map.fitBounds(L.geoJSON(nwpData).getBounds());

            // 2. Combine all point and polygon features into one array
            // IMPORTANT: We are NOT adding them to the map here. We are just storing them.
            allAssets = [...pointsData.features, ...polygonsData.features];

            // 3. Now that data is loaded, set up the interactive map listeners
            setupMapListeners();

        } catch (error) {
            console.error("Failed to load GeoJSON data:", error);
            alert("Could not load map location data. Please refresh the page.");
        }
    };

    // --- MAP INTERACTION LOGIC ---
    const setupMapListeners = () => {
        map.on('mousemove', (e) => {
            const foundFeature = findFeatureAt(e.latlng);

            if (foundFeature) {
                map.getContainer().style.cursor = 'pointer'; // Change cursor to a hand
                const displayName = foundFeature.properties.name || foundFeature.properties['name:en'] || 'Point of Interest';
                hoverTooltip.setLatLng(e.latlng).setContent(displayName).addTo(map);
            } else {
                map.getContainer().style.cursor = ''; // Change cursor back to default
                map.closeTooltip(hoverTooltip);
            }
        });

        map.on('click', (e) => {
            const foundFeature = findFeatureAt(e.latlng);
            if (foundFeature) {
                onAssetClick(foundFeature, e.latlng); // If a feature is found, open the form
            }
            // If no feature is found, nothing happens.
        });
    };

    // This function checks our stored data to see if the cursor is over an asset
    const findFeatureAt = (latlng) => {
        // Search polygons first, as they are larger targets
        for (const feature of allAssets) {
            if (feature.geometry.type === 'Polygon') {
                if (pointInPolygon([latlng.lng, latlng.lat], feature.geometry.coordinates[0])) {
                    return feature;
                }
            } else if (feature.geometry.type === 'MultiPolygon') {
                for(const poly of feature.geometry.coordinates) {
                    if (pointInPolygon([latlng.lng, latlng.lat], poly[0])) {
                        return feature;
                    }
                }
            }
        }

        // Then search points (check if cursor is very close to a point)
        const searchRadius = 0.001; // A small degree radius for finding points
        for (const feature of allAssets) {
            if (feature.geometry.type === 'Point') {
                const [lng, lat] = feature.geometry.coordinates;
                if (Math.abs(latlng.lat - lat) < searchRadius && Math.abs(latlng.lng - lng) < searchRadius) {
                    return feature;
                }
            }
        }

        return null; // No feature found at this location
    };

    // This function opens and populates the form when a valid asset is clicked
    const onAssetClick = (feature, latlng) => {
        const placeName = feature.properties.name || feature.properties['name:en'] || 'Unnamed Location';
        const locationString = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;

        form.reset();
        handleVisitedChange();
        
        document.getElementById('placeName').value = placeName;
        document.getElementById('location').value = locationString;

        formContainer.classList.remove('hidden');
    };

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

    // --- START THE APPLICATION ---
    loadData();
});