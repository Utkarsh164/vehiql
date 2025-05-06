"use client"
import React from 'react'
import { Badge } from './ui/badge';
import { format, parseISO } from 'date-fns';
import { Card } from './ui/card';
import Image from 'next/image';
import { Car } from 'lucide-react';


const formatTime=(timeString)=>{
    try{
        return format(parseISO(`2022-01-01T${timeString}`),"h:mm a");
    }catch(error){
        return timeString
    }
}
const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case "NO_SHOW":
        return <Badge className="bg-red-100 text-red-800">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  

const TestDriveCard = ({
    booking,
    onCancel,
    showActions=true,
    isPast=false,
    isAdmin=false,
    isCancelling=false,
    renderStatusSelector=()=>null
}) => {
   
  return (
    <>
      <Card className={`overflow-hidden ${
        isPast?"opacity-80 hover:opacity-100 transition-opacity":""
      }`}>
        <div className='flex flex-col sm:flex-row'> 
            <div className='sm:w-1/4 relative h-40 sm:h-auto'>
                {booking.car.images && booking.car.images.length>0?(
                    <div className='relative w-full h-full'>
                        <Image
                        src={booking.car.images[0]}
                        alt={`${booking.car.make} ${booking.car.model}`}
                        fill
                        className='object-cover'

                        />
                    </div>
                ):(<div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                    <Car className='h-12 w-12 text-gray-400'/>
                </div>)}
                <div className='absolute top-2 right-2 sm:hidden'>{getStatusBadge(booking.status)}</div>
            </div>
        </div>
      </Card>
    </>
  )
}

export default TestDriveCard
