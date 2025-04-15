"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CarIcon,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useFetch } from "@/hooks/use-fetch";
import { deleteCar, getCars, updateCarStatus } from "@/actions/cars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { formatCurrency } from "@/lib/healper";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { serializeCookieHeader } from "@supabase/ssr";

const CarsList = () => {
  const [search, setSearch] = useState("");
  const [carToDelete, setCarToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    loading: loadingCars,
    fn: fetchCars,
    data: carsData,
    error: carsError,
  } = useFetch(getCars);

  const {
    loading: deletingCar,
    fn: deleteCarFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteCar);

  useEffect(() => {
    fetchCars(search);
  }, [search]);
  const {
    loading: updatingCars,
    fn: updateCarStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateCarStatus);

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Car delete successfully");
      fetchCars(search);
    }
    if (updateResult?.success) {
      toast.success("car is updated successfully");
      fetchCars(search);
    }
  }, [updateResult, deleteResult]);

  const router = useRouter();
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars(search);
  };

  useEffect(() => {
    if (carsError) {
      toast.error("Failed to load cars");
    }
    if (deleteError) {
      toast.success("Failed to delete cars");
    }
    if (updateError) {
      toast.error("Failed to update cars");
    }
  }, [updateError, deleteError, carsError]);

  const handleDeleteCar = async () => {
    if (!carToDelete) return;
    await deleteCarFn(carToDelete.id);
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };
  const handleToggleFeatured = async (car) => {
    await updateCarStatusFn(car.id, { featured: !car.featured });
  };
  const handleStatusUpdate = async (car, newStatus) => {
    await updateCarStatusFn(car.id, { status: newStatus });
  };
  const getStatusBagde = (status) => {
    if (status === "AVAILABLE") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Available
        </Badge>
      );
    } else if (status === "UNAVAILABLE") {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          Unavailable
        </Badge>
      );
    } else if (status === "SOLD") {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Sold
        </Badge>
      );
    } else {
      return <Badge varient="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          onClick={() => {
            router.push("/admin/cars/create");
          }}
          className="flex items-center"
        >
          <Plus className="h-4 w-4" /> Add Cars
        </Button>
        <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              className="w-full pl-9 sm:w-60"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              type="search"
              placeholder="search cars..."
            />
          </div>
        </form>
      </div>
      {/* Cars Table */}
      <Card>
        <CardContent className="p-0">
          {loadingCars && !carsData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin  text-gray-400" />
            </div>
          ) : carsData?.success && carsData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carsData.data.map((car) => {
                    return (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">
                          {car.images && car.images.length > 0 ? (
                            <Image
                              src={car.images[0]}
                              alt={`${car.make} ${car.model}`}
                              height={40}
                              width={40}
                              className="w-full h-full object-cover"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <CarIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {car.make} {car.model}
                        </TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>{formatCurrency(car.price)}</TableCell>
                        <TableCell>{getStatusBagde(car.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-9 w-9"
                            disabled={updatingCars}
                            onClick={() => {
                              handleToggleFeatured(car);
                            }}
                          >
                            {car.featured ? (
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/cars/${car.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem
                              onClick={()=>handleStatusUpdate(car,"AVAILABLE")
                              }
                              disabled={
                                car.status==="AVAILABLE" || updatingCars
                              }
                              >Set Available</DropdownMenuItem>
                              <DropdownMenuItem
                               onClick={()=>handleStatusUpdate(car,"UNAVAILABLE")
                               }
                               disabled={
                                 car.status==="UNAVAILABLE" || updatingCars
                               }
                              >
                                Set Unavailable
                              </DropdownMenuItem>
                              <DropdownMenuItem
                               onClick={()=>handleStatusUpdate(car,"SOLD")
                               }
                               disabled={
                                 car.status==="SOLD" || updatingCars
                               }
                              >Mark as Sold</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setCarToDelete(car);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CarIcon className="h-12 w-12 text-grey-300 mb-4"/>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No cars found</h3>
              <p className="text-gray-500 mb-4">
                {
                  search? "No cars match your search criteria":"Your inventory is empty. Add cars to get started"
                }
              </p>
              <Button onClick={()=> router.push("/admin/cars/create")}>Add Your First Car</Button>
            </div>


          
          )}
        </CardContent>
      </Card>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {carToDelete?.make}{" "}
              {carToDelete?.make} ({carToDelete?.year})? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDeleteDialogOpen(false);
            }}
            disabled={deletingCar}
          >
            Cancel
          </Button>
          <Button
          variant="destructive"
          onClick={handleDeleteCar}
          disabled={deletingCar}
          >
            {
              deletingCar?(
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Deleting...
                </>
              ):("Delete Car")
            }
          </Button>
        </DialogFooter>
        </DialogContent>   
      </Dialog>
    </div>
  );
};

export default CarsList;
