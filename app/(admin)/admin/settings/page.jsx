
import React from 'react'
import SettingsForm from './_components/settings-form'
export const metadata={
  title:"Setting | Vehiql Admin",
  description:"Manage dealership working hours and admin users"
}

const SettingPage = () => {
  return (
    <div className='h-full w-full'>
      Setting Pages
      <SettingsForm/>
    </div>
  )
}



export default SettingPage
