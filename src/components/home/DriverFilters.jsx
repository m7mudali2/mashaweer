import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, Search } from 'lucide-react';
import { VEHICLE_TYPES } from '@/constants';
import { motion } from 'framer-motion';

const DriverFilters = ({ searchTerm, setSearchTerm, vehicleFilter, setVehicleFilter, onRefresh }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="sticky top-0 z-10 mb-4 p-3 bg-card shadow-lg rounded-b-xl"
    >
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-grow w-full">
          <Input
            type="text"
            placeholder="ابحث باسم السائق..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 text-sm sm:text-base border-2 border-input focus:border-primary transition-all duration-300 shadow-sm rounded-lg w-full h-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border-2 border-input focus:border-primary transition-all duration-300 shadow-sm rounded-lg h-full">
                <SelectValue placeholder="فلتر بنوع المركبة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المركبات</SelectItem>
                {VEHICLE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
          </div>
          <Button onClick={onRefresh} variant="ghost" size="icon" className="text-secondary hover:bg-secondary/10 p-2 h-full aspect-square">
            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DriverFilters;