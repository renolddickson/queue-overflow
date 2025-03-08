import React from 'react'
import Image from 'next/image'
const Logo = () => {
  return (
    <div className='w-8 h-8 relative'>
        <Image src="/assets/logo.png" fill alt='q' />
    </div>
  )
}

export default Logo