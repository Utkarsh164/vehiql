import React from 'react'

const CarPage = async ({params}) => {
  const {id}=await params;
  return (
    <div>
      <div>CarPage: {id}</div>
    </div>
  )
}

export default CarPage
