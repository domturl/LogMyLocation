// Service Worker (service-worker.js)
self.addEventListener('install', function(event) {
    console.log('Service Worker installed');
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activated');
});

self.addEventListener('message', function(event) {
    if (event.data.action === 'startLogging') {
        startBackgroundLogging();
    } else if (event.data.action === 'stopLogging') {
        stopBackgroundLogging();
    }
});

let watchId;
let positionData = [];

function startBackgroundLogging() {
    if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const timestamp = new Date().toISOString();

                positionData.push({ latitude, longitude, timestamp });
                console.log('Background location:', latitude, longitude, timestamp);
                // Optionally send data back to the main page or store it.
            },
            function(error) {
                console.error('Background geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: Infinity, // Keep watching indefinitely
                maximumAge: 0,
            }
        );
    } else {
        console.error('Geolocation not available in background.');
    }
}

function stopBackgroundLogging() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        console.log('Background logging stopped.');
        // Optionally save or process `positionData`.
    }
}