import React from 'react'
import { Loader2 } from 'lucide-react'

const Loader = () => {
  return (
    <div className='flex justify-center items-center h-[50vh] min-h-[400px] w-full'>
      <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
    </div>
  )
}

export default Loader