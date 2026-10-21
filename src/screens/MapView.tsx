import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'motion/react';
import Map, { Marker, Source, Layer, MapRef } from 'react-map-gl/maplibre';
import { Heart, MapPin, Clock, ChevronUp, MessageCircle, Navigation, ChevronRight, ChevronLeft, Bell, Calendar, Search } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const PulseDot = ({ color }: { color: string }) => (
  <div className="flex items-center justify-center w-full h-full relative">
    <div className="absolute w-[80px] h-[80px] rounded-full animate-ping" style={{ backgroundColor: color, opacity: 0.3, animationDuration: '3s' }}></div>
    <div className="w-[16px] h-[16px] rounded-full shadow-lg relative z-10 border-[3px] border-white" style={{ backgroundColor: color }}></div>
  </div>
);

const ScreenWrapper = ({ children, className }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`absolute inset-0 z-[100] overflow-hidden flex flex-col font-sans ${className}`}
  >
    {children}
  </motion.div>
);

const StatusBar = () => null;

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const MapView = ({ onBack, direction, userLocation, convoy, onNext, onNavigateChat, onNavigateNotifications, onNavigateCalendar }: any) => {
  const [routeProgress, setRouteProgress] = useState(0.02); // Start slightly visible
  const [routeCoordinates, setRouteCoordinates] = useState<number[][]>([]);
  const [walkingTimeMin, setWalkingTimeMin] = useState<number>(0);
  
  // Default user location if not provided (fallback)
  const currentUserLocation = userLocation || {
    longitude: -4.0083,
    latitude: 5.3600
  };

  // Real-time tracking state
  const [realUserLocation, setRealUserLocation] = useState(currentUserLocation);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  const mapRef = React.useRef<MapRef>(null);

  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [selectedNeed, setSelectedNeed] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mockProviders = useMemo(() => [
    { id: 1, name: 'Alice D.', role: 'Design', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80', rating: 4.8, location: 'À proximité', latitude: realUserLocation.latitude - 0.0047, longitude: realUserLocation.longitude + 0.0044 },
    { id: 2, name: 'Marc B.', role: 'Dev Web', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80', rating: 4.9, location: 'À proximité', latitude: realUserLocation.latitude + 0.0052, longitude: realUserLocation.longitude + 0.0094 },
    { id: 3, name: 'Jean P.', role: 'Photo', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80', rating: 4.7, location: 'À proximité', latitude: realUserLocation.latitude - 0.0002, longitude: realUserLocation.longitude - 0.0056 },
    { id: 4, name: 'Marie L.', role: 'Marketing', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80', rating: 5.0, location: 'À proximité', latitude: realUserLocation.latitude + 0.0152, longitude: realUserLocation.longitude - 0.0086 },
  ], [realUserLocation.latitude, realUserLocation.longitude]);

  const mockNeeds = [
    { id: 1, label: 'Éducation', providerIds: [1, 2] },
    { id: 2, label: 'Artisanat', providerIds: [3] },
    { id: 3, label: 'Informatique', providerIds: [2] },
    { id: 4, label: 'Réparation', providerIds: [3] },
    { id: 5, label: 'Beauté', providerIds: [4] },
    { id: 6, label: 'Transport', providerIds: [1] },
    { id: 7, label: 'Bien-être', providerIds: [4] },
    { id: 8, label: 'Événementiel', providerIds: [3, 4] },
    { id: 9, label: 'Déménagement', providerIds: [1] },
    { id: 10, label: 'Nettoyage', providerIds: [2] },
    { id: 11, label: 'Bricolage', providerIds: [3] },
    { id: 12, label: 'Photographie', providerIds: [3] },
    { id: 13, label: 'Architecture', providerIds: [1] },
    { id: 14, label: 'Jardinage', providerIds: [2] },
    { id: 15, label: 'Soutien scolaire', providerIds: [4] },
    { id: 16, label: 'Rédaction', providerIds: [4] },
    { id: 17, label: 'Vidéo', providerIds: [1, 3] },
    { id: 18, label: 'Sécurité', providerIds: [2] },
    { id: 19, label: 'Plomberie', providerIds: [3] },
    { id: 20, label: 'Électricité', providerIds: [2] },
    { id: 21, label: 'Design', providerIds: [1] },
    { id: 22, label: 'Marketing', providerIds: [4] },
    { id: 23, label: 'Traduction', providerIds: [2, 4] },
    { id: 24, label: 'Coaching', providerIds: [1] },
    { id: 25, label: "Garde d'enfants", providerIds: [4] },
    { id: 26, label: 'Musique', providerIds: [3] },
    { id: 27, label: 'Comptabilité', providerIds: [2] },
    { id: 28, label: 'Droit', providerIds: [4] },
    { id: 29, label: 'Cuisine', providerIds: [1] },
    { id: 30, label: 'Sport', providerIds: [3] },
  ];

  const filteredProviders = useMemo(() => {
    if (selectedNeed) {
      const need = mockNeeds.find(n => n.id === selectedNeed);
      if (need) return mockProviders.filter(p => need.providerIds.includes(p.id));
    }
    return mockProviders;
  }, [selectedNeed, mockProviders]);

  const filteredNeeds = useMemo(() => {
    let needs = mockNeeds;
    if (selectedProvider) {
      needs = needs.filter(n => n.providerIds.includes(selectedProvider));
    }
    if (searchQuery.trim() !== "") {
      needs = needs.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return needs;
  }, [selectedProvider, searchQuery]);

  // Selected provider location or fallback
  const selectedProviderData = mockProviders.find(p => p.id === selectedProvider);
  const targetLocation = selectedProviderData ? {
    latitude: selectedProviderData.latitude,
    longitude: selectedProviderData.longitude
  } : {
    latitude: realUserLocation.latitude - 0.0047,
    longitude: realUserLocation.longitude + 0.0044
  };

  const leaderName = selectedProviderData ? selectedProviderData.name : "Prestataire";

  // Format real arrival time
  const arrivalTime = useMemo(() => {
    const date = new Date(Date.now() + walkingTimeMin * 60000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [walkingTimeMin]);

  // Calculate distance
  const distanceKm = useMemo(() => {
    return getDistanceFromLatLonInKm(
      realUserLocation.latitude,
      realUserLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );
  }, [realUserLocation, targetLocation]);

  const distanceDisplay = distanceKm < 1 
    ? `${Math.round(distanceKm * 1000)} m` 
    : `${distanceKm.toFixed(1)} km`;

  // Watch real user location
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setRealUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Center the map on real location initially or when it updates if step 1
  useEffect(() => {
    if (step === 1 && mapRef.current) {
        mapRef.current.flyTo({
            center: [realUserLocation.longitude, realUserLocation.latitude],
            zoom: 15.5,
            duration: 1000
        });
    }
  }, [realUserLocation.latitude, realUserLocation.longitude, step]);

  // Fetch real route from OSRM
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${realUserLocation.longitude},${realUserLocation.latitude};${targetLocation.longitude},${targetLocation.latitude}?overview=full&geometries=geojson`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          setRouteCoordinates(data.routes[0].geometry.coordinates);
          setWalkingTimeMin(Math.max(1, Math.round(data.routes[0].duration / 60)));
        } else {
          setRouteCoordinates([
            [realUserLocation.longitude, realUserLocation.latitude],
            [targetLocation.longitude, targetLocation.latitude]
          ]);
          setWalkingTimeMin(Math.round(distanceKm * 12));
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        setRouteCoordinates([
          [realUserLocation.longitude, realUserLocation.latitude],
          [targetLocation.longitude, targetLocation.latitude]
        ]);
        setWalkingTimeMin(Math.round(distanceKm * 12));
      }
    };
    
    // Only fetch once initially or if target changes, to avoid re-fetching constantly while walking
    if (routeCoordinates.length === 0) {
      fetchRoute();
    }
  }, [realUserLocation.longitude, realUserLocation.latitude, targetLocation.longitude, targetLocation.latitude, distanceKm, routeCoordinates.length]);

  // Calculate initial distance once to determine progress
  useEffect(() => {
    if (routeCoordinates.length > 0 && initialDistance === null) {
      const dist = getDistanceFromLatLonInKm(
        realUserLocation.latitude,
        realUserLocation.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      );
      setInitialDistance(dist);
    }
  }, [routeCoordinates, realUserLocation, targetLocation, initialDistance]);

  // Update progress based on real location
  useEffect(() => {
    if (initialDistance) {
      const currentDist = getDistanceFromLatLonInKm(
        realUserLocation.latitude,
        realUserLocation.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      );
      
      let progress = 1 - (currentDist / initialDistance);
      progress = Math.max(0.02, Math.min(1, progress)); // Keep between 2% and 100%
      setRouteProgress(progress);
    }
  }, [realUserLocation, initialDistance, targetLocation]);

  // Generate route data based on progress
  const getRouteData = () => {
    if (routeCoordinates.length === 0) return null;
    
    // Show the full route
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routeCoordinates
      }
    };
  };

  // Calculate dynamic zoom based on distance to fit both points
  const dynamicZoom = Math.max(13, 15 - Math.log2(distanceKm || 1));

  const controls = useAnimation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle Map transition when moving to step 2
  useEffect(() => {
    if (step === 2 && mapRef.current) {
      // Zoom out or fit bounds
      const bounds: [number, number, number, number] = [
        Math.min(realUserLocation.longitude, targetLocation.longitude) - 0.002, // minX
        Math.min(realUserLocation.latitude, targetLocation.latitude) - 0.002, // minY
        Math.max(realUserLocation.longitude, targetLocation.longitude) + 0.002, // maxX
        Math.max(realUserLocation.latitude, targetLocation.latitude) + 0.002, // maxY
      ];
      
      mapRef.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 350, left: 50, right: 50 },
        duration: 1500,
        pitch: 45,
        bearing: -15
      });
    }
  }, [step, realUserLocation, targetLocation]);

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y > threshold) {
      // Dragged down -> collapse
      setIsExpanded(false);
      controls.start({ y: 0 }); 
    } else if (info.offset.y < -threshold) {
      // Dragged up -> expand
      setIsExpanded(true);
      controls.start({ y: 0 });
    } else {
      // Snap back
      controls.start({ y: 0 });
    }
  };

  return (
    <ScreenWrapper direction={direction} className="bg-[#0f111a]">
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: realUserLocation.longitude,
            latitude: realUserLocation.latitude,
            zoom: 15.5,
            pitch: 0,
            bearing: 0,
          }}
          mapStyle={MAP_STYLE}
          attributionControl={false}
        >
          {/* Animated Route Line */}
          {step === 2 && routeCoordinates.length > 0 && (
            <Source id="route" type="geojson" data={getRouteData() as any}>
              <Layer
                id="route-line-glow"
                type="line"
                paint={{
                  'line-color': '#8B5CF6',
                  'line-width': 12,
                  'line-blur': 10,
                  'line-opacity': 0.6
                }}
              />
              <Layer
                id="route-line"
                type="line"
                paint={{
                  'line-color': '#38BDF8',
                  'line-width': 4,
                }}
              />
            </Source>
          )}

          {/* Target Pulse for Selected Provider */}
          {step === 2 && (
            <Marker 
              longitude={targetLocation.longitude} 
              latitude={targetLocation.latitude} 
              anchor="center"
            >
              <PulseDot color="#38BDF8" />
            </Marker>
          )}

          {/* User Location Marker (Start) */}
          <Marker 
            longitude={realUserLocation.longitude} 
            latitude={realUserLocation.latitude} 
            anchor="center"
          >
            <PulseDot color="#F43F5E" />
          </Marker>

          {/* All Providers or Selected Provider */}
          {mockProviders.map((provider, i) => {
            if (step === 2 && provider.id !== selectedProvider) return null;
            
            // Alternating rotation for a bit of style if step === 1
            const rotation = step === 2 ? "" : (i % 2 === 0 ? "-rotate-6" : "rotate-6");
            
            return (
              <Marker key={provider.id} longitude={provider.longitude} latitude={provider.latitude} anchor="center">
                <div 
                  onClick={() => {
                    if (step === 1) setSelectedProvider(provider.id);
                  }}
                  className={`bg-white p-1 rounded-[1.25rem] shadow-[0_8px_15px_rgba(0,0,0,0.1)] inline-block transform ${rotation} cursor-pointer transition-all ${selectedProvider === provider.id ? 'scale-125 ring-4 ring-[#38BDF8] z-50' : 'hover:scale-110'}`}
                >
                  <img src={provider.image} alt={provider.name} className="w-[38px] h-[38px] rounded-[1rem] object-cover" />
                </div>
              </Marker>
            );
          })}
        </Map>
        
        {/* Dark vignette overlay for atmosphere */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,17,26,0.8)_100%)]"></div>
      </div>
      
      <StatusBar />

      {/* Navigation Button (Left side) */}
      <div className="absolute top-12 sm:top-14 left-4 z-10 pointer-events-auto">
        <button 
          onClick={onBack}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-white border border-white/20 shrink-0"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Draggable Bottom Card Container */}
      <motion.div 
        className="absolute left-4 right-4 z-20 flex flex-col mb-6"
        animate={{ 
          height: isExpanded ? 'calc(100vh - 120px)' : 'auto',
          bottom: 0,
          y: 0
        }}
        initial={{ y: 0, bottom: 0, height: 'auto' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={onDragEnd}
      >
        <div className="relative w-full h-full flex flex-col pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6 text-white min-h-[300px]">
          {/* SVG Background for Curved Shape - Glassmorphism */}
          <div className="absolute inset-0 z-0 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
            <div 
              className="absolute inset-0 backdrop-blur-2xl bg-white/10"
              style={{
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 0 340 260' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 40 Q 0 0 40 0 Q 170 15 300 0 Q 340 0 340 40 L 340 220 Q 340 260 300 260 Q 170 245 40 260 Q 0 260 0 220 Z' fill='black' /%3E%3C/svg%3E")`,
                WebkitMaskSize: '100% 100%',
                maskImage: `url("data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 0 340 260' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 40 Q 0 0 40 0 Q 170 15 300 0 Q 340 0 340 40 L 340 220 Q 340 260 300 260 Q 170 245 40 260 Q 0 260 0 220 Z' fill='black' /%3E%3C/svg%3E")`,
                maskSize: '100% 100%'
              }}
            >
              {/* Subtle inner gradient for glass effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-30"></div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col min-h-0">
            {/* Drag Handle */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full cursor-grab active:cursor-grabbing"></div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mt-4 flex-1 flex flex-col min-h-0"
                >
                  {!isExpanded && (
                    <div className="mb-4">
                      <h3 className="text-white font-bold text-[16px] mb-3 opacity-90 text-center">Prestataires à proximité</h3>
                      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-1">
                        {filteredProviders.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => setSelectedProvider(selectedProvider === p.id ? null : p.id)}
                            className={`flex flex-col items-center gap-2 min-w-[70px] p-2 rounded-2xl cursor-pointer transition-all ${selectedProvider === p.id ? 'bg-white/20 scale-105 shadow-lg relative' : 'hover:bg-white/5 opacity-80'}`}
                          >
                            <img 
                              src={p.image} 
                              className="w-14 h-14 rounded-full object-cover border-2" 
                              style={{ borderColor: selectedProvider === p.id ? '#38BDF8' : 'transparent' }} 
                              alt={p.name}
                            />
                            <span className="text-[12px] font-medium text-white truncate w-full text-center">{p.name.split(' ')[0]}</span>
                            {selectedProvider === p.id && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F43F5E] rounded-full border-2 border-[#1E1E2E] flex items-center justify-center">
                                <span className="text-[10px] font-bold">✓</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {filteredProviders.length === 0 && (
                          <p className="text-white/60 text-sm text-center w-full my-4">Aucun prestataire ne correspond à ce besoin.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-4 flex-1 flex flex-col min-h-0">
                    <h3 className="text-white font-bold text-[16px] mb-3 opacity-90 text-center">Quel est votre besoin ?</h3>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-2 mb-4"
                        >
                          <div className="bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center shadow-inner">
                             <Search size={16} className="text-white/60 mr-2 shrink-0" />
                             <input 
                               type="text" 
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                               placeholder="Rechercher un besoin..." 
                               className="bg-transparent text-white placeholder-white/50 text-sm outline-none flex-1 w-full" 
                             />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={`flex gap-2 flex-wrap px-1 justify-center contents-start ${isExpanded ? 'overflow-y-auto pb-4 hide-scrollbar flex-1 content-start' : 'max-h-[100px] overflow-y-auto content-start'}`}>
                      {filteredNeeds.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => setSelectedNeed(selectedNeed === n.id ? null : n.id)}
                          className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-all mb-1 ${selectedNeed === n.id ? 'bg-[#38BDF8] text-white shadow-lg scale-105' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}`}
                        >
                          {n.label}
                        </div>
                      ))}
                      {filteredNeeds.length === 0 && (
                        <p className="text-white/60 text-sm text-center w-full my-4">Aucun besoin ne correspond à votre recherche.</p>
                      )}
                    </div>
                  </div>

                  {!isExpanded && (
                    <div className="flex justify-center mt-6 shrink-0">
                      <button 
                        onClick={() => {
                          if (selectedProvider && selectedNeed) setStep(2);
                        }}
                        disabled={!selectedProvider || !selectedNeed}
                        className={`w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-lg shadow-black/20 transition-all ${(!selectedProvider || !selectedNeed) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                      >
                        <ChevronRight size={24} className="ml-0.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  {/* Selected Provider Info */}
                  {(() => {
                    const provider = mockProviders.find(p => p.id === selectedProvider);
                    if (!provider) return null;
                    return (
                      <>
                        <div className="flex justify-between items-start mt-2">
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                              <h3 className="text-[#EAB308] font-semibold text-[15px] sm:text-[18px] truncate">{provider.name}</h3>
                              <div className="flex items-center text-white/90 text-[12px] bg-white/10 px-1.5 rounded-md">
                                <span className="text-[#EAB308] mr-0.5">★</span> {provider.rating}
                              </div>
                            </div>
                            <p className="text-gray-300 text-[13px] sm:text-[14px] truncate">{provider.location}</p>
                          </div>
                          <button className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/30 flex items-center justify-center active:scale-95 transition-transform shrink-0">
                            <Heart size={20} className="sm:w-6 sm:h-6 text-[#F43F5E] fill-current" />
                          </button>
                        </div>

                        {/* Title (Need) */}
                        <h1 className="text-white font-bold text-[26px] sm:text-[36px] leading-tight mt-3 sm:mt-5 mb-4 sm:mb-6 truncate">
                          {mockNeeds.find(n => n.id === selectedNeed)?.label || "Intervention en cours"}
                        </h1>
                      </>
                    );
                  })()}

                  {/* Progress Bar Section */}
                  <div className="w-full mb-auto mt-2">
                    <div className="flex justify-between items-end mb-2 px-1">
                      <div className="text-[13px] sm:text-[15px] font-medium text-white/90 truncate">{distanceDisplay}</div>
                      <div className="text-[13px] sm:text-[15px] font-medium text-white/90 truncate">{walkingTimeMin} min</div>
                      <div className="text-[13px] sm:text-[15px] font-bold text-white truncate">{arrivalTime}</div>
                    </div>
                    <div className="relative h-1.5 bg-white/20 rounded-full">
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#4ADE80] rounded-full transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                        style={{ width: `${routeProgress * 100}%` }}
                      ></div>
                      {/* Arrow Head */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 -ml-1.5 transition-all duration-300 ease-linear"
                        style={{ left: `${routeProgress * 100}%` }}
                      >
                        <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[9px] border-l-white drop-shadow-md"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex justify-between items-center relative mt-8 sm:mt-10 mb-1 w-full overflow-hidden">
                    {/* Left Actions Group */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                      {/* Message Button */}
                      <button 
                        onClick={onNavigateChat}
                        className="h-[52px] sm:h-14 px-5 sm:px-6 bg-[#38BDF8] rounded-full flex items-center justify-center gap-2 font-bold text-white shadow-lg active:scale-95 transition-transform shrink-0"
                      >
                        <MessageCircle size={20} className="sm:w-6 sm:h-6 fill-current" />
                        <span className="text-[14px] sm:text-[16px]">Message</span>
                      </button>

                      <div className="flex items-center gap-3">
                        {/* Notification Button */}
                        <button 
                          onClick={onNavigateNotifications}
                          className="w-[52px] h-[52px] sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform shrink-0"
                        >
                          <Bell size={20} className="sm:w-6 sm:h-6 fill-white" />
                        </button>
                        
                        {/* Calendar Button */}
                        <button 
                          onClick={onNavigateCalendar}
                          className="w-[52px] h-[52px] sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform shrink-0"
                        >
                          <Calendar size={20} className="sm:w-6 sm:h-6" />
                        </button>
                      </div>
                    </div>

                    {/* Right Arrow Button */}
                    <button 
                      onClick={onNext}
                      className="w-[52px] h-[52px] sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center text-black shadow-lg active:scale-95 transition-transform shrink-0 ml-auto"
                    >
                      <ChevronRight size={24} className="sm:w-7 sm:h-7" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </ScreenWrapper>
  );
};

