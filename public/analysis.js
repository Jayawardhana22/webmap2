document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const analysisTitle = document.getElementById('analysis-title');
    const totalReportsEl = document.getElementById('total-reports');
    const avgSatisfactionEl = document.getElementById('avg-satisfaction');
    const recommendRateEl = document.getElementById('recommend-rate');
    const commonSeasonEl = document.getElementById('common-season');
    
    // Chart Canvases
    const frequencyCanvas = document.getElementById('frequency-chart');
    const bestThingCanvas = document.getElementById('best-thing-chart');

    const chartObjects = {}; // To hold chart instances

    // Get the place name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const placeName = urlParams.get('placeName');

    if (!placeName) {
        analysisTitle.textContent = "Error: No place specified.";
        return;
    }

    analysisTitle.textContent = `Analysis Dashboard for: ${placeName}`;
    const apiUrl = `/api/assets?placeName=${encodeURIComponent(placeName)}`;

    // --- DATA PROCESSING & RENDERING FUNCTIONS ---

    const updateStatCards = (reports) => {
        const visitedReports = reports.filter(r => r.hasVisited === 'Yes');
        if (visitedReports.length === 0) {
            document.querySelector('.stats-grid').innerHTML = '<p>No visitor feedback available to analyze.</p>';
            return;
        }

        totalReportsEl.textContent = reports.length;

        // Avg. Satisfaction
        const satisfactionRatings = visitedReports.map(r => r.overallSatisfaction).filter(Boolean);
        const avgSatisfaction = satisfactionRatings.reduce((a, b) => a + b, 0) / satisfactionRatings.length;
        avgSatisfactionEl.textContent = satisfactionRatings.length > 0 ? `${avgSatisfaction.toFixed(1)} / 5` : 'N/A';
        
        // Recommendation Rate
        const recommendations = visitedReports.filter(r => r.wouldRecommend === 'Yes').length;
        const recommendRate = (recommendations / visitedReports.length) * 100;
        recommendRateEl.textContent = `${recommendRate.toFixed(0)}%`;

        // Common Season
        const seasonCounts = countOccurrences(visitedReports, 'seasonOfVisit');
        const commonSeason = getMostCommon(seasonCounts);
        commonSeasonEl.textContent = commonSeason;
    };

    const renderPieChart = (canvas, chartId, reports, property, title) => {
        const counts = countOccurrences(reports.filter(r => r.hasVisited === 'Yes'), property);
        
        if (chartObjects[chartId]) chartObjects[chartId].destroy();

        chartObjects[chartId] = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: title,
                    data: Object.values(counts),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: title }
                }
            }
        });
    };
    
    // --- UTILITY FUNCTIONS ---
    const countOccurrences = (arr, key) => {
        return arr.reduce((acc, item) => {
            const value = item[key];
            if (value) {
                acc[value] = (acc[value] || 0) + 1;
            }
            return acc;
        }, {});
    };

    const getMostCommon = (counts) => {
        if (Object.keys(counts).length === 0) return 'N/A';
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    };

    // --- MAIN EXECUTION ---
    const fetchAndAnalyze = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            const reports = await response.json();
            
            if (reports.length > 0) {
                updateStatCards(reports);
                renderPieChart(frequencyCanvas, 'freqChart', reports, 'visitFrequency', 'Visitor Frequency');
                renderPieChart(bestThingCanvas, 'bestThingChart', reports, 'bestThing', '"Best Thing" About This Place');
            } else {
                analysisTitle.textContent = `No reports found for ${placeName}`;
                document.querySelector('.stats-grid').style.display = 'none';
                document.querySelector('.chart-grid').style.display = 'none';
            }
        } catch (error) {
            console.error('Analysis Error:', error);
            analysisTitle.textContent = 'Could not load analysis data.';
        }
    };
    
    fetchAndAnalyze();
});