import React from 'react'
import Image from '../common/Image'

const ImageBlock = ({content}:{content:string | null}) => {
  return (
    <div className='relative flex justify-center'>
    <Image src={content || 'assets/no-image.jpg'} alt="img" />
    </div>
  )
}

export default ImageBlock