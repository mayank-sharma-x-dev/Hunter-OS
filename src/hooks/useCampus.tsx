import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";

export const useCampus = () => {
  const { toast } = useToast();
  const [campus, setCampus] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userCampus");
    if (saved) setCampus(saved);
  }, []);

  const saveCampus = useCallback((name: string) => {
    setCampus(name);
    localStorage.setItem("userCampus", name);
  }, []);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not supported", description: "Please enter your campus manually.", variant: "destructive" });
      return;
    }

    setLocationLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode using free Nominatim API
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18`
      );
      const data = await res.json();
      
      // Extract campus/university name from address
      const address = data.address || {};
      const campusName = address.university || address.college || address.school || 
                         address.building || address.amenity || 
                         `${address.suburb || address.neighbourhood || ""}, ${address.city || address.town || ""}`.trim();
      
      if (campusName && campusName !== ", ") {
        saveCampus(campusName);
        toast({ title: "📍 Campus Detected!", description: campusName });
      } else {
        toast({ 
          title: "Location found", 
          description: "Couldn't identify a campus. Try entering it manually by telling Lucy!",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({ 
        title: "Location access denied", 
        description: "Tell Lucy your campus name instead!", 
        variant: "destructive" 
      });
    } finally {
      setLocationLoading(false);
    }
  }, [toast, saveCampus]);

  return { campus, setCampus: saveCampus, detectLocation, locationLoading };
};
