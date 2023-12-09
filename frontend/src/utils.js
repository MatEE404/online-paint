export const handleUpdate = (ctx, { x0, y0, x1, y1, color, size }) => {
  ctx.lineCap = "round"
  ctx.lineWidth = size
  ctx.fillStyle = color
  ctx.strokeStyle = color

  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()
  ctx.closePath()
}

export const handleContextMenu = (e) => {
  e.preventDefault()
}

export const getPosition = (e) => {
  if (e.touches?.length === 1)
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  return {
    x: e?.clientX,
    y: e?.clientY,
  }
}
