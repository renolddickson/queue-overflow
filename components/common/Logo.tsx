import React from 'react'
import Image from 'next/image'
const Logo = ({className}:{className?:string}) => {
  return (
    <div className={`${className ? className :'w-8 h-8'} relative`}>
        <Image src="/assets/logo.webp" fill alt='q' />
    </div>
  )
}

export default Logo