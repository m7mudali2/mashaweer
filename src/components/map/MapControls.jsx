import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LocateFixed, RefreshCw, Search } from 'lucide-react';

const MapControls = ({ searchQuery, setSearchQuery, handleSearch, goToUserLocation, refreshMapData }) => {
  return (
    <>
      <form onSubmit={handleSearch} className="absolute top-4 right-4 left-4 md:left-auto md:w-80 bg-background p-2 rounded-lg shadow-lg z-10 flex items-center gap-2">
        <Input 
          type="text" 
          placeholder="ابحث عن موقع..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" size="icon" variant="ghost"><Search className="h-5 w-5 text-primary" /></Button>
      </form>
      <div className="absolute bottom-20 md:bottom-4 right-4 z-10 flex flex-col gap-2">
        <Button size="icon" onClick={goToUserLocation} className="bg-background hover:bg-muted shadow-md">
          <LocateFixed className="h-5 w-5 text-primary" />
        </Button>
        <Button size="icon" onClick={refreshMapData} className="bg-background hover:bg-muted shadow-md">
          <RefreshCw className="h-5 w-5 text-primary" />
        </Button>
      </div>
    </>
  );
};

export default MapControls;