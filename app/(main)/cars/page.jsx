import { getCarFilters } from '@/actions/car-listing'
import React from 'react'
import CarFilters from './_components/car-filters'
import CarListing from './_components/car-listing'

export const metadata={
    title:"Cars | Vehiql",
    description:"Browse and search for your dream car"
}
const CarsPage =async () => {
    const filtersData=await getCarFilters() 

  return (
    <div className='container mx-auto px-4 py-12'>
      <h1 className='text-6xl md-4 gradient-title'>Browse Cars</h1>
      <div className='flex flex-col lg:flex-row gap-8'>

      {/* yaha lagana hai */}
        <div className='w-full lg:w-80 flex-shrink-0'>{/*Filters*/} 
            <CarFilters filters={filtersData.data}/>
        </div>
        <div className='w-full lg:w-230 flex-shrink-0'>{/*Listing yaha w-80 tha*/}
            <CarListing/>
        </div>
      </div>
    </div>
  )
}
//
//w-fit lg:flex-row gap-8
export default CarsPage
