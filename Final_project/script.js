// ============================================
// WEATHER DASHBOARD - FINAL VERSION
// ============================================

const API_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const LATITUDE = 61.4991;
const LONGITUDE = 23.7871;
const TIMEZONE = 'Europe/Helsinki';

let weatherChart = null;
let currentVariable = 'temperature_2m';
let currentDays = 1;

// Weather variables
const weatherVariables = [
    { id: 'temperature_2m', name: 'Temperature', unit: '°C', color: '#ff6b6b' },
    { id: 'rain', name: 'Rain', unit: 'mm', color: '#4d96ff' },
    { id: 'wind_speed_10m', name: 'Wind Speed', unit: 'km/h', color: '#6bc5a9' }
];

// ============================================
// THEME
// ============================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('themeIcon').className = 'fas fa-sun';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.getElementById('themeIcon').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ============================================
// FETCH WEATHER DATA (FIXED)
// ============================================

async function fetchWeatherData(variable, options = {}) {
    showLoading(true);

    try {
        let url = `${API_BASE_URL}?latitude=${LATITUDE}&longitude=${LONGITUDE}&hourly=${variable}&timezone=${encodeURIComponent(TIMEZONE)}`;

        if (options.startDate && options.endDate) {
            url += `&start_date=${options.startDate}&end_date=${options.endDate}`;
        } else {
            const safeDays = Math.min(options.pastDays || 1, 7);
            url += `&past_days=${safeDays}&forecast_days=0`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.hourly) throw new Error("No hourly data");

        const times = data.hourly.time;
        const values = data.hourly[variable];

        const filtered = [];

        for (let i = 0; i < times.length; i++) {
            if (values[i] !== null) {
                filtered.push({
                    time: times[i],
                    value: values[i]
                });
            }
        }

        filtered.sort((a, b) => new Date(a.time) - new Date(b.time));

        const last20 = filtered.slice(-20);

        return {
            times: last20.map(d => d.time),
            values: last20.map(d => d.value),
            allValues: filtered.map(d => d.value)
        };

    } catch (error) {
        console.error(error);
        showError("Failed to fetch weather data.");
        return { times: [], values: [], allValues: [] };
    } finally {
        showLoading(false);
    }
}

// ============================================
// STATISTICS
// ============================================

function calculateStatistics(numbers) {
    if (!numbers.length) return {};

    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;

    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

    const frequency = {};
    let mode = numbers[0];
    let maxFreq = 0;

    numbers.forEach(n => {
        frequency[n] = (frequency[n] || 0) + 1;
        if (frequency[n] > maxFreq) {
            maxFreq = frequency[n];
            mode = n;
        }
    });

    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const range = max - min;

    const variance = numbers.reduce((sum, n) => sum + (n - mean) ** 2, 0) / numbers.length;
    const stdDev = Math.sqrt(variance);

    return { mean, median, mode, min, max, range, variance, stdDev };
}

// ============================================
// HELPERS
// ============================================

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = show ? 'block' : 'none';
}

function showError(msg) {
    document.getElementById('contentArea').innerHTML =
        `<div class="alert alert-danger">${msg}</div>`;
}

function formatTime(timeString) {
    const date = new Date(timeString);

    return date.toLocaleString('fi-FI', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// DISPLAY
// ============================================

function displayTable(times, values, variableInfo) {
    return times.map((t, i) => `
        <tr>
            <td>${formatTime(t)}</td>
            <td><strong>${values[i].toFixed(1)} ${variableInfo.unit}</strong></td>
        </tr>
    `).join('');
}

function displayStatistics(stats, variableInfo) {
    return `
        <div class="row">
            <div class="col-md-4 mb-2"><strong>Mean:</strong> ${stats.mean.toFixed(2)} ${variableInfo.unit}</div>
            <div class="col-md-4 mb-2"><strong>Median:</strong> ${stats.median.toFixed(2)} ${variableInfo.unit}</div>
            <div class="col-md-4 mb-2"><strong>Mode:</strong> ${stats.mode.toFixed(2)} ${variableInfo.unit}</div>
            <div class="col-md-4 mb-2"><strong>Range:</strong> ${stats.range.toFixed(2)} ${variableInfo.unit}</div>
            <div class="col-md-4 mb-2"><strong>Std Dev:</strong> ${stats.stdDev.toFixed(2)} ${variableInfo.unit}</div>
            <div class="col-md-4 mb-2"><strong>Min:</strong> ${stats.min.toFixed(2)} ${variableInfo.unit}</div>
            <div class="col-md-4 mb-2"><strong>Max:</strong> ${stats.max.toFixed(2)} ${variableInfo.unit}</div>
            <div class="col-md-4 mb-2"><strong>Variance:</strong> ${stats.variance.toFixed(2)} ${variableInfo.unit}²</div>
        </div>
    `;
}

function createOrUpdateChart(times, values, variableInfo) {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    if (weatherChart) weatherChart.destroy();

    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times.map(t => formatTime(t)),
            datasets: [{
                label: `${variableInfo.name} (${variableInfo.unit})`,
                data: values,
                borderColor: variableInfo.color,
                backgroundColor: variableInfo.color + "33",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// ============================================
// MAIN CUSTOM VIEW (PHASE 5)
// ============================================

async function showMainView() {

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const endDate = today.toISOString().split('T')[0];
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    document.getElementById('contentArea').innerHTML = `
        <h2 class="mb-4">Weather Dashboard</h2>

        <div class="card mb-4">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">Measurement</label>
                        <select class="form-select" id="variableSelect">
                            ${weatherVariables.map(v =>
                                `<option value="${v.id}">${v.name} (${v.unit})</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Start Date</label>
                        <input type="date" id="startDate" class="form-control" value="${startDate}">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">End Date</label>
                        <input type="date" id="endDate" class="form-control" value="${endDate}">
                    </div>
                </div>

                <button class="btn btn-primary mt-3" onclick="updateCustomView()">
                    Update Data
                </button>
            </div>
        </div>

        <div id="customDataDisplay"></div>
    `;

    await updateCustomView();
}

async function updateCustomView() {

    const variable = document.getElementById('variableSelect').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (startDate > endDate) {
        alert("Start date must be before end date.");
        return;
    }

    const variableInfo = weatherVariables.find(v => v.id === variable);

    const { times, values, allValues } = await fetchWeatherData(variable, {
        startDate,
        endDate
    });

    if (!times.length) {
        document.getElementById('customDataDisplay').innerHTML =
            `<div class="alert alert-warning">No data available.</div>`;
        return;
    }

    const stats = calculateStatistics(allValues);

    document.getElementById('customDataDisplay').innerHTML = `
        <div class="card mb-3">
            <div class="card-body table-responsive">
                <table class="table">
                    <thead><tr><th>Time</th><th>Value</th></tr></thead>
                    <tbody>${displayTable(times, values, variableInfo)}</tbody>
                </table>
            </div>
        </div>

        <div class="card mb-3">
            <div class="card-body">
                <div style="height:300px;">
                    <canvas id="weatherChart"></canvas>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                ${displayStatistics(stats, variableInfo)}
            </div>
        </div>
    `;

    createOrUpdateChart(times, values, variableInfo);
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    showMainView();
});

window.updateCustomView = updateCustomView;

// Function to switch variable using header buttons
function showView(type) {
    let variable;

    if (type === 'temperature') {
        variable = 'temperature_2m';
    } else if (type === 'rain') {
        variable = 'rain';
    } else if (type === 'wind') {
        variable = 'wind_speed_10m';
    }

    // Update the dropdown selection in custom view
    const select = document.getElementById('variableSelect');
    if (select) {
        select.value = variable;
    }

    // Update active button styling
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        const btn = event.target.closest('.nav-btn');
        if (btn) btn.classList.add('active');
    }

    // Refresh the data
    updateCustomView();
}

window.showView = showView;
