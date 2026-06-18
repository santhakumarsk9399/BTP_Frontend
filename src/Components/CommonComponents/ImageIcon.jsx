import React from 'react'
const ImageIcon = ({img, Img_width,Img_height }) => {
  return (
    <div>
        <img src={img} width={Img_width}height={Img_height} />
    </div>
  )
}

export default ImageIcon;