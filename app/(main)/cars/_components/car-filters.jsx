"use client";
import { usePathname, useSearchParams } from "next/navigation";
//import { useRouter } from "next/router";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge, Filter } from "lucide-react";
import CarFilterControls from "./filter-controls";

const CarFilters = ({ filters }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMake = searchParams.get("make") || "";
  const currentBodyType = searchParams.get("bodyType") || "";
  const currentFuelType = searchParams.get("fuelType") || "";
  const currentTransmission = searchParams.get("transmission") || "";
  const currentMinPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice"))
    : filters.priceRange.min;
  const currentMaxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice"))
    : filters.priceRange.max;
  const currentSortBy = searchParams.get("sortBy") || "newest";

  const [make, setMake] = useState(currentMake);
  const [bodyType, setBodyType] = useState(currentBodyType);
  const [fuelType, setFuelType] = useState(currentFuelType);
  const [transmission, setTransmission] = useState(currentTransmission);
  const [priceRange, setPriceRange] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setMake(currentMake);
    setBodyType(currentBodyType);
    setFuelType(currentFuelType);
    setTransmission(currentTransmission);
    setPriceRange([currentMinPrice, currentMaxPrice]);
    setSortBy(currentSortBy);
  }, [
    currentBodyType,
    currentFuelType,
    currentMake,
    currentMaxPrice,
    currentMinPrice,
    currentSortBy,
    currentTransmission,
  ]);
  const activeFilterCount = [
    make,
    bodyType,
    fuelType,
    transmission,
    currentMinPrice > filters.priceRange.min ||
      currentMaxPrice < filters.priceRange.max,
  ].filter(Boolean).length;

  const currentFilters = {
    make,
    bodyType,
    fuelType,
    transmission,
    priceRangeMin: filters.priceRange.min,
    priceRangeMax: filters.priceRange.max,
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === "make") {
      setMake(value);
    } else if (filterName === "bodyType") {
      setMake(value);
    } else if (filterName === "fuelType") {
      setMake(value);
    } else if (filterName === "transmission") {
      setMake(value);
    } else if (filterName === "priceRange") {
      setMake(value);
    }
  };
  const handleClearFilter = (filterName) => {
    handleFilterChange(filterName, "");
  };
  const clearFilters = () => {
    setMake("");
    setBodyType("");
    setFuelType("");
    setTransmission("");
    setPriceRange([filters.priceRange.min, filters.priceRange.max]);
    setSortBy("newest");
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) {
      params.set("search", search);
    }
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.push(url);
    setIsSheetOpen(false);
  };
  const applyFilters=()=>{
    const params = new URLSearchParams();
    if(make) params.set("make",make)
    if(bodyType) params.set("bodyType",bodyType);
    if(fuelType) params.set("fuelType",fuelType);
    if(transmission) params.set("transmission",transmission);
    if(priceRange[0]>filters.priceRange.min)
      params.set("minPrice",priceRange[0].toString());
    if(priceRange[1]<filters.priceRange.max)
      params.set("maxPrice",priceRange[1].toString());
    if(sortBy!=="newest") params.set("sort",sortBy);

    const search=searchParams.get("search");
    const page=searchParams.get("page");

    if(search) params.set("search",search);
    if(page && page!=="1") params.set("page",page);

    const query=params.toString();
    const url=query?`${pathname}?${query}`:pathname;
    router.push(url);
  }
  return (
    <div>
      {/* Mobile Filters */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters{" "}
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full sm:max-w-md overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              <div className="py-6">
                <CarFilterControls
                  filters={filters}
                  currentFilters={currentFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilter={handleClearFilter}
                />
              </div>
              <SheetFooter className="sm:justify-between flex-row pt-2 border-t space-x-4 mt-auto">
                <Button
                  type="button"
                  varient="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button type="button" onClick={applyFilters} className="flex-1">
                  Show Result
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Sort selection */}
      <div></div>

      {/* Desktop Filters */}
      <div></div>
    </div>
  );
};

export default CarFilters;
