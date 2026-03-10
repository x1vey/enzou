import React, { createElement as e, useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'https://esm.sh/react-map-gl@8.1.0?bundle';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZW56b3Vkcnl3YWxsIiwiYSI6ImNsdHAxZ2huaDAwdmoycW8ycXF6M2Z1cnoifQ.x-x-x-x-x-x-x-x-x-x-x';

export function Map({ center, zoom, mapStyle, children }) {
  const [viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom: zoom
  });

  return e(ReactMapGL, {
    ...viewState,
    onMove: evt => setViewState(evt.viewState),
    style: { width: '100%', height: '100%' },
    mapStyle: mapStyle || "mapbox://styles/mapbox/dark-v11",
    mapboxAccessToken: MAPBOX_TOKEN
  }, children);
}

export function MapMarker({ longitude, latitude, children }) {
  const [showPopup, setShowPopup] = useState(false);

  const kids = React.Children.toArray(children);
  const content = kids.find(c => c.type === MarkerContent);
  const tooltip = kids.find(c => c.type === MarkerTooltip);
  const popup = kids.find(c => c.type === MarkerPopup);

  return e(React.Fragment, null,
    e(Marker, { longitude, latitude, anchor: "bottom", onClick: e => {
        e.originalEvent.stopPropagation();
        setShowPopup(true);
      } 
    }, 
      e('div', { 
        style: { cursor: 'pointer' },
        title: tooltip ? tooltip.props.children : '',
        onMouseEnter: () => setShowPopup(true),
        onMouseLeave: () => setShowPopup(false)
      }, content ? content.props.children : null)
    ),
    showPopup && popup ? 
      e(Popup, { 
        longitude, 
        latitude, 
        anchor: "top", 
        onClose: () => setShowPopup(false),
        closeButton: false,
        closeOnClick: false,
        offset: [0, 10]
      }, popup.props.children) 
    : null
  );
}

export function MarkerContent({ children }) {
  return children; 
}

export function MarkerTooltip({ children }) {
  return null; 
}

export function MarkerPopup({ children }) {
  return e('div', { className: 'map-popup-custom' }, children); 
}
