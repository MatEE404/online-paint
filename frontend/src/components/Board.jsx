import styled from "styled-components"
import { CirclePicker } from "react-color"
import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

import {
  FaPaintBrush as PaintBrush,
  FaEraser as Rubber,
  FaPlus as Plus,
  FaMinus as Minus,
} from "react-icons/fa"

const MIN_LINE_SIZE = 4
const MAX_LINE_SIZE = 64

const Container = styled.main`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Panel = styled.section`
  width: 100px;
  height: 100%;
  background: #eee;
  border-right: 1px solid #ddd;
  box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.1);
  gap: 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: column;
  overflow: hidden;

  button {
    color: ${({ selectedColor }) => selectedColor};
  }
`

const Options = styled.div`
  width: 100%;
  gap: 0.5rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const Button = styled.button`
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  border-radius: 12px;
  border: 1px solid #ccc;
  background: #fff;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease-in-out;
  transform: scale(${({ isActive }) => (isActive ? 0.85 : 1)});

  svg {
    transition: all 0.25s ease-in-out;
  }

  &:hover {
    background: #ddd;

    svg {
      transform: scale(0.9);
    }
  }

  &:active svg {
    transform: scale(1.2);
  }
`

const ColorPicker = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .circle-picker {
    width: 100% !important;
    margin-bottom: 0.5rem !important;
    align-items: center;
    justify-content: center;
  }
`

const Canvas = styled.canvas`
  width: calc(100% - 100px);
  height: 100vh;
  cursor: none;
`

const Pointer = styled.div`
  position: absolute;
  z-index: 9999;
  cursor: none;
  border: 1px solid #000;
  border-radius: 100%;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  display: none;
`

const BoardComponent = () => {
  const [selectedTool, setSelectedTool] = useState("BRUCH")
  const [selectedColor, setSelectedColor] = useState("#000")
  const [isPainting, setIsPainting] = useState(false)
  const [lineSize, setLineSize] = useState(8)
  const [socket, setSocket] = useState()
  const [ctx, setCtx] = useState()
  const pointerRef = useRef()
  const canvasRef = useRef()

  const handleChangeColor = (color) => {
    setSelectedColor(color.hex)
  }

  const handleMouseDown = (e) => {
    setIsPainting(true)
    handleMouseMove(e)
  }

  const handleMouseUp = () => {
    setIsPainting(false)
    ctx.beginPath()
  }

  const handleMouseEnter = () => {
    pointerRef.current.style.display = "block"
  }

  const handleMouseLeave = () => {
    pointerRef.current.style.display = "none"
  }

  const handleMouseMove = (e) => {
    let { x, y } = canvasRef.current.getBoundingClientRect()

    pointerRef.current.style.left = `${e.clientX - lineSize / 2}px`
    pointerRef.current.style.top = `${e.clientY - lineSize / 2}px`

    if (!isPainting) return

    x = e.clientX - x
    y = e.clientY - y

    ctx.lineCap = "round"
    ctx.lineWidth = lineSize
    ctx.fillStyle = selectedTool === "RUBBER" ? "#fff" : selectedColor
    ctx.strokeStyle = selectedTool === "RUBBER" ? "#fff" : selectedColor

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)

    socket.emit("update", canvasRef.current.toDataURL("image/png"))
  }

  const handlePlusSize = () => {
    setLineSize(MAX_LINE_SIZE > lineSize ? lineSize + 4 : lineSize)
  }

  const handleMinusSize = () => {
    setLineSize(MIN_LINE_SIZE < lineSize ? lineSize - 4 : lineSize)
  }

  const handleUpdate = (ctx, source) => {
    let image = new Image()
    image.src = source
    ctx.drawImage(image, 0, 0)
    console.log(source)
  }

  useEffect(() => {
    const canvas = canvasRef.current

    let { width, height } = canvasRef.current.getBoundingClientRect()
    canvas.height = height
    canvas.width = width

    const ctx = canvasRef.current.getContext("2d")
    setCtx(ctx)

    const socket = io(process.env.REACT_APP_SERVER_URL, {
      transports: ["websocket"],
    })
    setSocket(socket)

    socket.on("canvas", (source) => handleUpdate(ctx, source))
  }, [])

  return (
    <Container>
      <Panel selectedColor={selectedColor}>
        <Options>
          <Button onClick={handlePlusSize} isActive={true}>
            <Plus />
          </Button>
          <Button onClick={handleMinusSize} isActive={true}>
            <Minus />
          </Button>
          <Button
            onClick={() => setSelectedTool("BRUCH")}
            isActive={selectedTool === "BRUCH"}>
            <PaintBrush />
          </Button>
          <Button
            onClick={() => setSelectedTool("RUBBER")}
            isActive={selectedTool === "RUBBER"}>
            <Rubber />
          </Button>
        </Options>
        <ColorPicker>
          <CirclePicker
            color={selectedColor}
            onChange={handleChangeColor}
            circleSpacing={10}
            colors={[
              "#f44336",
              "#e91e63",
              "#9c27b0",
              "#673ab7",
              "#3f51b5",
              "#2196f3",
              "#03a9f4",
              "#00bcd4",
              "#009688",
              "#4caf50",
              "#8bc34a",
              "#cddc39",
              "#ffeb3b",
              "#ffc107",
              "#ff9800",
              "#ff5722",
              "#795548",
              "#607d8b",
              "#43495c",
              "#18191b",
            ]}
          />
        </ColorPicker>
      </Panel>
      <Pointer
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        size={lineSize}
        ref={pointerRef}
      />
      <Canvas
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={canvasRef}
      />
    </Container>
  )
}

export default BoardComponent
