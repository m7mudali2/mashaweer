export const INTRO_VIEWED_KEY = 'mashaweer_intro_viewed_v1';
export const DRIVER_PHONE_KEY = 'mashaweer_driver_phone_v1';

export const MAPBOX_TOKEN = 'pk.eyJ1IjoibTdtdWRhbGkiLCJhIjoiY205eXIzMDQyMWh6bTJpc21rYXljMHk1OCJ9.IfFTOq10sYq1l1xmLNa6fw';

export const MAP_INITIAL_STATE = {
  longitude: 46.6753, // Riyadh longitude
  latitude: 24.7136,  // Riyadh latitude
  zoom: 10,
  pitch: 45,
  bearing: -17.6,
};

export const VEHICLE_TYPES = [
  { value: 'tuk_tuk', label: 'توكتوك' },
  { value: 'scooter', label: 'سكوتر' },
  { value: 'private_car', label: 'سيارة خاصة' },
  { value: 'taxi', label: 'تاكسي' },
  { value: 'transport_car', label: 'سيارة نقل' },
];

export const MAP_STYLES = [
    { id: 'streets-v12', label: 'شوارع', url: 'mapbox://styles/mapbox/streets-v12'},
    { id: 'outdoors-v12', label: 'خارجي', url: 'mapbox://styles/mapbox/outdoors-v12'},
    { id: 'light-v11', label: 'فاتح', url: 'mapbox://styles/mapbox/light-v11'},
    { id: 'dark-v11', label: 'داكن', url: 'mapbox://styles/mapbox/dark-v11'},
    { id: 'satellite-streets-v12', label: 'قمر صناعي', url: 'mapbox://styles/mapbox/satellite-streets-v12'},
    { id: 'navigation-day-v1', label: 'ملاحة (نهاري)', url: 'mapbox://styles/mapbox/navigation-day-v1'},
    { id: 'navigation-night-v1', label: 'ملاحة (ليلي)', url: 'mapbox://styles/mapbox/navigation-night-v1'},
];

export const DEFAULT_MAP_STYLE_URL = 'mapbox://styles/mapbox/streets-v12';