import { onMount, onCleanup } from "solid-js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import archiveNodes from "../assets/archiveNode.json";

export default function LeafletMap() {
  let map;

  onMount(() => {
    map = L.map("map", { tap: false }).setView([40.7439, -74.0247], 12);

    L.tileLayer(
      "https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg",
      {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      }
    ).addTo(map);

    initMap();
  });

  onCleanup(() => {
    if (map) {
      map.remove();
    }
  });

  function initMap() {
    createArchiveMarkers(archiveNodes);
  }

  function createArchiveMarkers(archiveNodes) {
    const archives = archiveNodes.archives || [];
    const archiveClusterGroup = L.markerClusterGroup();

    for (const archive of archives) {
      const archiveMarker = L.marker([archive.lat, archive.lon]);

      archiveMarker.bindPopup(`
        <h3>${archive.name}</h3>
        <p>${archive.description}</p>
      `);

      archiveClusterGroup.addLayer(archiveMarker);

      for (const collection of archive.collections) {
        const collectionMarker = L.marker([archive.lat, archive.lon]);

        collectionMarker.bindPopup(`
          <strong>${collection.collectionName}</strong><br>
          <a href="https://example.com/drive/${collection.driveId}" target="_blank">Drive Link</a><br>
          <a href="https://example.com/folder/${collection.parentFolderId}" target="_blank">Parent Folder Link</a>
        `);

        archiveClusterGroup.addLayer(collectionMarker);
      }
    }

    archiveClusterGroup.on('clusterclick', function (a) {
      if (a.layer._zoom === 18) {
        let popUpText = '<ul>';
        for (const marker of a.layer.getAllChildMarkers()) {
          const props = marker.getPopup().getContent();
          popUpText += `<li>${props}</li>`;
        }
        popUpText += '</ul>';

        const popup = L.popup()
          .setLatLng(a.layer.getLatLng())
          .setContent(popUpText)
          .openOn(map);
      }
    });

    map.addLayer(archiveClusterGroup);
  }

  return (
    <div
      id="map"
      style={{
        height: "60vh",
        width: "100%",
        margin: "0",
      }}
    />
  );
}