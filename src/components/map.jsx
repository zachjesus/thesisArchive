import { onMount, onCleanup } from "solid-js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import archiveNode from "../assets/archiveNode.json"; // Adjusted path for src assets

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
    if (archiveNode) {
      createArchiveMarkers(archiveNode);
    }
  }

  function createArchiveMarkers(archive) {
    const archiveClusterGroup = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        const text = archive.name; 
        const circleSize = 120; 

        return L.divIcon({
          html: `
            <div style="
              background-color: ${archive.fillColor};
              color: white;
              width: ${circleSize}px;
              height: ${circleSize}px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              text-align: center;
              padding: 10px;
              max-width: ${circleSize}px;
              word-wrap: break-word;
              overflow: hidden;
            ">
              ${text}
            </div>
          `,
          className: "custom-cluster-icon",
          iconSize: [circleSize, circleSize], 
        });
      },
    });

    map.addLayer(archiveClusterGroup);

    const archiveMarker = L.circleMarker([archive.lat, archive.lon], {
      radius: 15,
      color: archive.color,
      fillColor: archive.fillColor,
      fillOpacity: 0.8,
      weight: 3,
    });

    archiveMarker.bindPopup(`
      <h3>${archive.name}</h3>
      <p>${archive.description}</p>
    `);

    archiveClusterGroup.addLayer(archiveMarker);

    for (const collection of archive.collections) {
      const collectionMarker = L.circleMarker(
        [
          archive.lat + Math.random() * 0.01,
          archive.lon + Math.random() * 0.01,
        ],
        {
          radius: 10,
          color: archive.color,
          fillColor: archive.fillColor,
          fillOpacity: 1,
          weight: 3,
        }
      );

      collectionMarker.bindPopup(`<h4>${collection.collectionName}</h4>`);
      archiveClusterGroup.addLayer(collectionMarker);

      linkNodes(archiveMarker, collectionMarker);
    }
  }

  function linkNodes(nodeA, nodeB) {
    const a = nodeA.getLatLng();
    const b = nodeB.getLatLng();

    L.polyline([a, b], {
      color: "#000",
      weight: 2,
      opacity: 0.9,
    }).addTo(map);
  }

  return (
    <div
      id="map"
      style={{
        height: "100vh",
        width: "100vw",
        margin: "0",
      }}
    />
  );
}