import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div>
      <Link href="/q/1/1">
      <button>preview</button>
      </Link>
      <Link href="/q-edit/1">
      <button>Editor</button>
      </Link>
    </div>
  )
}

export default page