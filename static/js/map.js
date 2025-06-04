const MAP_JSON_PATH = "../static/json/map_points.json";
const CONFIG_JSON_PATH = "../static/json/config.json";

let globalMap = null;

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
}

function updateMapContentByHash(points) {
    const hash = window.location.hash.replace('#', '');
    const selected = points.find(p => String(p.map_id) === String(hash));

    if (hash && selected) {
        updateMapCenter(selected.lat, selected.lng, 16);
    }
}

function updateMapCenter(lat, lng, zoom = 15) {
    if (globalMap) {
        globalMap.setCenter({ lat: lat, lng: lng });
        globalMap.setZoom(zoom);
    }
}

readTextFile(CONFIG_JSON_PATH, function (text) {
    var data_config = JSON.parse(text);
    const API_KEY = data_config.apiKey;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.initMap = function () {
        const center = { lat: 37.5665, lng: 126.9780 };
        globalMap = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: center
        });

        readTextFile(MAP_JSON_PATH, function (pointText) {
            const data = JSON.parse(pointText);
            const points = data.points;

            document.getElementById('search-btn').addEventListener('click', function () {
                const searchType = document.getElementById('search-type').value;
                const keyword = document.getElementById('address-input').value.trim();
                const resultBox = document.getElementById('search-results');

                let filtered = [];

                if (searchType === "1") {
                    filtered = points.filter(p => p.title.includes(keyword));
                } else if (searchType === "2") {
                    filtered = points.filter(p => p.description.includes(keyword));
                }

                resultBox.innerHTML = filtered.length > 0
                    ? filtered.map(p =>
                        `<div>${p.title} - ${p.description}<button onclick="location.assign('find_store.html#${p.map_id}')">위치 찾기</button></div>`
                    ).join('')
                    : `<div>검색 결과가 없습니다.</div>`;
            });

            const markers = points.map(p => {
                const marker = new google.maps.Marker({
                    position: { lat: p.lat, lng: p.lng },
                    title: p.title
                });

                if (p.title || p.description) {
                    const info = new google.maps.InfoWindow({
                        content: `<strong><a href="#${p.map_id}">${p.title}</a></strong>`
                    });

                    marker.addListener("click", () => info.open(globalMap, marker));
                }

                return marker;
            });

            new markerClusterer.MarkerClusterer({ map: globalMap, markers });
        });
    };
});


window.addEventListener('hashchange', () => {
    readTextFile(MAP_JSON_PATH, function (pointText) {
        const data = JSON.parse(pointText);
        updateMapContentByHash(data.points);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash) {
        readTextFile(MAP_JSON_PATH, function (pointText) {
            const data = JSON.parse(pointText);
            updateMapContentByHash(data.points);
        });
    }
});

window.addEventListener('load', () => {
    if (window.location.hash) {
        setTimeout(() => {
            readTextFile(MAP_JSON_PATH, function (pointText) {
                const data = JSON.parse(pointText);
                updateMapContentByHash(data.points);
            });
        }, 1000); // 1초 후 재시도
    }
});
