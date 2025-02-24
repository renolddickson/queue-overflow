import ContentEditor from '@/components/editor/ContentEditor'
import LeftPanelEditor from '@/components/editor/LeftPanelEditor'
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