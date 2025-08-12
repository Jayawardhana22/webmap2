document.addEventListener('DOMContentLoaded', () => {
    // --- MAP INITIALIZATION ---
    const map = L.map('map').setView([7.8731, 80.7718], 8); // Center on Sri Lanka
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marker; // To hold the user's location marker

    // --- UI ELEMENTS ---
    const formContainer = document.getElementById('form-container');
    const form = document.getElementById('asset-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const showAllReportsBtn = document.getElementById('show-all-reports-btn');
    const hasVisitedSelect = document.getElementById('hasVisited');
    const visitDetailsSection = document.getElementById('visit-details-section');
    const feedbackSection = document.getElementById('feedback-section');

    // --- MAP EVENT LISTENER ---
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // Set form location value
        document.getElementById('location').value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        // Add or move marker
        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }

        // Show the form
        form.reset(); // Clear previous entries before showing
        handleVisitedChange(); // Set initial form state
        formContainer.classList.remove('hidden');
    });

    // --- FORM LOGIC ---
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

    // Hide form on cancel
    cancelBtn.addEventListener('click', () => {
        formContainer.classList.add('hidden');
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Clear non-applicable fields if user hasn't visited
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
            // Note the changed API endpoint
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
            if (marker) {
                map.removeLayer(marker);
                marker = null;
            }
        } catch (error) {
            console.error('Submission Error:', error);
            alert(`Submission Error: ${error.message}`);
        }
    });
    
    // --- NAVIGATION ---
    showAllReportsBtn.addEventListener('click', () => {
        // We will create this page next
        window.location.href = 'reports.html';
    });
});