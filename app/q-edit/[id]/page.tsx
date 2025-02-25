import ContentEditor from '@/app/q-edit/(components)/ContentEditor'
import LeftPanelEditor from '@/app/q-edit/(components)/LeftPanelEditor'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-row'>
    <LeftPanelEditor />
    <ContentEditor />
    </div>
  )
}

export default page