document.addEventListener('DOMContentLoaded', () => {
    const reportTitle = document.getElementById('report-title');
    const reportTableBody = document.getElementById('report-table-body');
    const searchInput = document.getElementById('search-input');

    let allReports = [];

    const renderTable = (reports) => {
        reportTableBody.innerHTML = '';
        if (reports.length === 0) {
            // Updated colspan from 7 to 6
            reportTableBody.innerHTML = '<tr><td colspan="6">No reports found.</td></tr>';
            return;
        }

        reports.forEach(report => {
            const row = document.createElement('tr');
            row.dataset.placeName = report.placeName;

            row.innerHTML = `
                <td>${report.placeName}</td>
                <td>${report.assetType}</td>
                <!-- REMOVED Country TD -->
                <td>${report.hasVisited}</td>
                <td>${report.overallSatisfaction ? `${report.overallSatisfaction} / 5` : 'N/A'}</td>
                <td>${new Date(report.createdAt).toLocaleDateString()}</td>
                <td><button class="analysis-btn">View Analysis</button></td>
            `;
            reportTableBody.appendChild(row);
        });
    };

    const fetchReports = async () => {
        try {
            const response = await fetch('/api/assets');
            if (!response.ok) throw new Error('Failed to fetch data');
            
            allReports = await response.json();
            reportTitle.textContent = 'All Submitted Asset Reports';
            renderTable(allReports);

        } catch (error) {
            console.error('Error fetching reports:', error);
            reportTitle.textContent = 'Failed to load reports';
            reportTableBody.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
        }
    };

    // --- EVENT LISTENERS ---
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Updated filter to remove country
        const filteredReports = allReports.filter(report => 
            report.placeName.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredReports);
    });

    reportTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('analysis-btn')) {
            const row = e.target.closest('tr');
            const placeName = row.dataset.placeName;
            if (placeName) {
                window.location.href = `analysis.html?placeName=${encodeURIComponent(placeName)}`;
            }
        }
    });

    fetchReports();
});