"use client"
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router'
import React from 'react'

const CarFilters = ({filters}) => {
    const router=useRouter();
    const pathname=usePathname();
    const searchParams=useSearchParams()
  return (
    <div>
      <div>car filter</div>
    </div>
  )
}

export default CarFilters
