self.addEventListener('install', function(event) {
    console.log('Service Worker installed');
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activated');
});

let watchId;
let positionData =;

function startBackgroundLogging() {
    if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const timestamp = new Date().toISOString();

                positionData.push({ latitude, longitude, timestamp });
                const logMessage = `Background location: ${latitude}, ${longitude}, ${timestamp}`;
                console.log(logMessage);

                // Send the log message to the main page
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        // Send the latest location data
                        client.postMessage({
                            action: 'logMessage',
                            message: `Latest location: ${latitude}, ${longitude}`,
                            timestamp: timestamp
                        });
                    });
                });
            },
            function(error) {
                console.error('Background geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: Infinity,
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
    }
}

function generateKML(positions) {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>Position Log</name>
<Placemark>
<name>Location Trail</name>
<LineString>
<coordinates>`;

    positions.forEach(pos => {
        kml += `${pos.longitude},${pos.latitude},0\n`;
    });

    kml += `</coordinates>
</LineString>
</Placemark>
</Document>
</kml>`;

    return kml;
}

self.addEventListener('message', function(event) {
    if (event.data.action === 'startLogging') {
        startBackgroundLogging();
    } else if (event.data.action === 'stopLogging') {
        stopBackgroundLogging();
    } else if (event.data.action === 'downloadKML') {
        const kml = generateKML(positionData);
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({action: 'kmlData', kml: kml});
          });
        });
    }
});
