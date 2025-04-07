'use client'
import { featuredCars } from '@/lib/data'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tabs, TabsContent, TabsList,TabsTrigger } from '@/components/ui/tabs'


const fuelType=["Petrol","Diesel","Electric","Hybrid","Plug-in Hybrid"]
const transmissions=["Automatic","Manual","Semi-Automatic"]
const bodyType=["SUV","Sedan","Hatchback","Convertible","Coupe","Wagon","Pickup"]
const carStatuses=["AVAILABLE","UNAVAILABLE","SOLD"]

const AddCarForm = () => {
  const [activeTab,setActiveTab]=useState("ai");
  const carFormSchema=z.object({
    make: z.string().min(1,"Make is required"),
    model: z.string().min(1,"Model is required"),
    year: z.string().refine((val)=>{
      return(
        !isNaN(year) && year>=1900 && year<=new Date().getFullYear()+1
      )
    },"Valid year required"),
    price: z.string().min(1,"Price is required"),
    mileage: z.string().min(1,"Mileage is required"),
    color: z.string().min(1,"color is required"),
    fuelType: z.string().min(1,"Fuel Type is required"),
    transmission: z.string().min(1,"Transmission is required"),
    bodyType: z.string().min(1,"Body Type is required"),
    seat: z.string().optional(),
    description:z.string().min(10,"Description must be at least 10 characters"),
    status: z.enum(["AVAILABLE","UNAVAILABLE","SOLD"]),
    featured: z.boolean().default(false),
  })
  const {register,setValue,getValues,formState:{error},handleSubmit,watch}=useForm({
    resolver:zodResolver(carFormSchema),
    defaultValues:{ 
      make:"",
      model: "",
      year:"",
      price: "",
      mileage:"",
      color: "",
      fuelType:"",
      transmission:"",
      bodyType:"",
      seat: "",
      description:"",
      status:"",
      featured:"",

    }
  })
  return (
    <div>
      <Tabs defaultValue="ai" className="mt-6" value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
    <TabsTrigger value="ai">AI Upload</TabsTrigger>
  </TabsList>
  <TabsContent value="manual" className="mt-6">Make changes to your account here.</TabsContent>
  <TabsContent value="ai" className="mt-6">Change your password here.</TabsContent>
</Tabs>

    </div>
  )
}

export default AddCarForm
