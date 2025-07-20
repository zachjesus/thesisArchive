import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import L from 'leaflet';
import 'leaflet.markercluster';

import Arweave from 'arweave';

let map;
let universityMarker;
let markerClusterGroup;
let connectionLines = [];

window.addEventListener('load', function () {
    map = L.map('map', { tap: false }).setView([40.7439, -74.0247], 12); // Disable tap delay

    L.tileLayer('https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
    }).addTo(map);

    markerClusterGroup = L.markerClusterGroup();
    map.addLayer(markerClusterGroup);

    initializeSimpleMap();
});

async function initializeSimpleMap() {
    console.log('Initializing Map...');

    const university = await loadUniversityConfig();

    createUniversityMarker(university);
}

async function loadUniversityConfig() {
    try {
        const nodeConfig = await fetch('/archiveNode.json').then(r => r.json());
        return nodeConfig;
    } catch (error) {
        console.error('Error loading university config:', error);
        return null;
    }
}

async function createUniversityMarker(university) {
    universityMarker = L.circleMarker([university.lat, university.lon], {
        radius: 15,
        color: university.color,
        fillColor: university.fillColor,
        fillOpacity: 0.8,
        weight: 3
    });

    universityMarker.bindPopup(`
    <h3>${university.name}</h3>
    <p>${university.description}</p>
  `);

    universityMarker.addTo(map);

    for (const collection of university.collections) {
        const collectionNode = L.circleMarker([university.lat + Math.random() * 0.01, university.lon + Math.random() * 0.01], {
            radius: 10,
            color: university.color,
            fillColor: university.fillColor,
            fillOpacity: 1,
            weight: 3
        }).addTo(map);

        collectionNode.bindPopup(`<h4>${collection.collectionName}</h4>`);

        linkNodes(universityMarker, collectionNode);

        let itemNodes = [];
        let polylines = [];
        let itemsLoaded = false;

        collectionNode.on('click', async function () {
            if (itemsLoaded) {
                // Remove item nodes and polylines
                itemNodes.forEach(node => map.removeLayer(node));
                polylines.forEach(line => map.removeLayer(line));
                itemNodes = [];
                polylines = [];
                itemsLoaded = false;
            } else {
                // Load items and create nodes
                const items = await getItemsInParentFolder(collection.driveId, collection.parentFolderId);
                const radius = 0.008;
                items.forEach((item, i) => {
                    const angle = (2 * Math.PI * i) / items.length;
                    const lat = collectionNode.getLatLng().lat + radius * Math.cos(angle);
                    const lon = collectionNode.getLatLng().lng + radius * Math.sin(angle);
                    const itemNode = L.circleMarker([lat, lon], {
                        radius: 7,
                        color: '#1565c0',
                        fillColor: '#1976d2',
                        fillOpacity: 1,
                        weight: 1
                    }).addTo(map);

                    itemNode.bindPopup(`
                        <h5>${item.metadata.title || item.metadata.name}</h5>
                        <img src="/api/data/${item.metadata.dataTxId}" style="max-width:200px;display:block;margin-bottom:8px;">
                        <p>${item.metadata.description || ''}</p>
                        <ul>
                            <li><b>Date:</b> ${item.metadata.date || ''}</li>
                            <li><b>Format:</b> ${item.metadata.format || ''}</li>
                            <li><b>Subject:</b> ${item.metadata.subject || ''}</li>
                            <li><b>Identifier:</b> ${item.metadata.identifier || ''}</li>
                        </ul>
                    `);

                    const polyline = linkNodes(collectionNode, itemNode);
                    polylines.push(polyline);
                    itemNodes.push(itemNode);
                });
                itemsLoaded = true;
            }
        });
    }
}

function linkNodes(nodeA, nodeB) {
    const a = nodeA.getLatLng();
    const b = nodeB.getLatLng();
    const rA = (nodeA.options.radius || 10) / 111000; 
    const rB = (nodeB.options.radius || 10) / 111000; 

    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return; 

    const ax = a.lat + (dy / dist) * rA;
    const ay = a.lng + (dx / dist) * rA;
    const bx = b.lat - (dy / dist) * rB;
    const by = b.lng - (dx / dist) * rB;

    const polyline = L.polyline([[ax, ay], [bx, by]], { color: '#000', weight: 2, opacity: 0.9 }).addTo(map);
    return polyline;
}

async function getItemsInParentFolder(driveID, parentFolderID) {
    try {
        const response = await fetch(`/api/folder/${driveID}?parentFolderId=${parentFolderID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const txs = await response.json();
        console.log('Backend response:', txs);
        return txs;
    } catch (error) {
        console.error('Backend error:', error);
        return [];
    }
}