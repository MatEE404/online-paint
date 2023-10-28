import styled from "styled-components"
import { CirclePicker } from "react-color"
import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { v4 as uuid } from "uuid"
import {
  FaPaintBrush as PaintBrush,
  FaEraser as Rubber,
  FaPlus as Plus,
  FaMinus as Minus,
} from "react-icons/fa"

import {
  TRANSLATE_REGEX,
  MIN_LINE_SIZE,
  MAX_LINE_SIZE,
  LINE_COLORS,
  BOARD_HEIGHT,
  BOARD_WIDTH,
} from "../constants"

const Container = styled.main`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const Panel = styled.section`
  width: 100px;
  height: 100%;
  background: #eee;
  border-right: 1px solid #ddd;
  box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.1);
  gap: 1rem;
  z-index: 11;
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
  transform: scale(${({ isActive }) => (isActive ? 0.6 : 1)});

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

const Board = styled.section`
  width: calc(100% - 100px);
  background: #ccc;
  height: 100vh;
  position: relative;
`

const Canvas = styled.canvas`
  background: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(
    ${({ width }) => `${width / -2}px`},
    ${({ height }) => `${height / -2}px`}
  );
  cursor: none;
`

const Pointer = styled.div`
  position: fixed;
  z-index: 10;
  cursor: none;
  border: 1px solid #000;
  border-radius: 100%;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  display: none;
`

const Players = styled.div`
  position: fixed;
  top: 1.5rem;
  left: 2rem;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  z-index: 9999;

  span {
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 100%;
    background: red;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 14px;
      height: 14px;
      border-radius: 100%;
      background: rgba(255, 0, 0, 0.3);
    }
  }
`

const BoardComponent = () => {
  const [startPositionMouse, setStartPositionMouse] = useState({ x: 0, y: 0 })
  const [startPositionBoard, setStartPositionBoard] = useState({ x: 0, y: 0 })
  const [selectedColor, setSelectedColor] = useState("#000")
  const [selectedTool, setSelectedTool] = useState("BRUCH")
  const [paintingID, setPaintingID] = useState(null)
  const [isMoving, setIsMoving] = useState(false)
  const [lineSize, setLineSize] = useState(8)
  const [players, setPlayers] = useState(1)
  const [changes, setChanges] = useState([])
  const [socket, setSocket] = useState()
  const [ctx, setCtx] = useState()
  const pointerRef = useRef()
  const canvasRef = useRef()

  const handleContextMenu = (e) => {
    e.preventDefault()
  }

  const handleChangeColor = (color) => {
    setSelectedColor(color.hex)
  }

  const handleMouseDown = (e) => {
    if (e?.button === 2) {
      setIsMoving(true)
      setStartPositionMouse({ x: e.clientX, y: e.clientY })

      let x = BOARD_WIDTH / -2
      let y = BOARD_HEIGHT / -2

      let match = canvasRef.current.style.transform.match(TRANSLATE_REGEX)

      if (match) {
        x = parseInt(match[1])
        y = parseInt(match[2])
      }

      setStartPositionBoard({ x, y })
    } else {
      setPaintingID(uuid())
      handleMouseMove(e)
    }
  }

  const handleMouseUp = (e) => {
    if (e?.button === 2) {
      setIsMoving(false)
      setStartPositionMouse({ x: 0, y: 0 })
    } else {
      socket.emit("update", changes)
      ctx.beginPath()
      setChanges([])
      setPaintingID(null)
    }
  }

  const handleMouseMoveCursor = (e) => {
    let { x, y } = canvasRef.current.getBoundingClientRect()
    let { clientX, clientY } = e

    if (clientX < x || clientY < y) {
      pointerRef.current.style.display = "none"
      handleMouseUp()
    } else {
      pointerRef.current.style.display = "block"
    }
  }

  const handleMouseMove = (e) => {
    let { clientX, clientY } = e

    pointerRef.current.style.left = `${e.clientX - lineSize / 2}px`
    pointerRef.current.style.top = `${e.clientY - lineSize / 2}px`

    if (paintingID) {
      let { x, y } = canvasRef.current.getBoundingClientRect()

      const change = {
        id: paintingID,
        x: clientX - x,
        y: clientY - y,
        color: selectedTool === "RUBBER" ? "#fff" : selectedColor,
        size: lineSize,
      }

      handleUpdate(ctx, change)
      setChanges([...changes, change])
    } else if (isMoving) {
      let deltaX = startPositionMouse.x - clientX
      let deltaY = startPositionMouse.y - clientY

      let translate = `${startPositionBoard.x - deltaX}px, 
        ${startPositionBoard.y - deltaY}px`

      canvasRef.current.style.transform = `translate(${translate})`
    }
  }

  const handlePlusSize = () => {
    setLineSize(MAX_LINE_SIZE > lineSize ? lineSize + 4 : lineSize)
  }

  const handleMinusSize = () => {
    setLineSize(MIN_LINE_SIZE < lineSize ? lineSize - 4 : lineSize)
  }

  const handleUpdate = (ctx, { x, y, color, size }) => {
    console.log({ x, y, color, size })
    ctx.lineCap = "round"
    ctx.lineWidth = size
    ctx.fillStyle = color
    ctx.strokeStyle = color

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handleChanges = (ctx, changes) => {
    const _changes = {}

    for (const index in changes) {
      let change = changes[index]

      if (_changes[change.id]) {
        _changes[change.id].push(change)
      } else {
        _changes[change.id] = [change]
      }
    }

    for (const key in _changes) {
      for (const index in _changes[key]) {
        handleUpdate(ctx, _changes[key][index])
      }
      ctx.beginPath()
    }
  }

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d")
    setCtx(ctx)

    const socket = io(process.env.REACT_APP_SERVER_URL, {
      transports: ["websocket"],
    })
    setSocket(socket)

    socket.on("chnages", (changes) => handleChanges(ctx, changes))
    socket.on("players", (players) => setPlayers(players))
  }, [])

  return (
    <Container onMouseMove={handleMouseMoveCursor}>
      {players > 1 ? (
        <Players>
          <span></span>
          {players}
        </Players>
      ) : (
        <></>
      )}
      <Panel selectedColor={selectedColor}>
        <Options>
          <Button onClick={handlePlusSize} isActive={false}>
            <Plus />
          </Button>
          <Button onClick={handleMinusSize} isActive={false}>
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
            colors={LINE_COLORS}
          />
        </ColorPicker>
      </Panel>
      <Board onContextMenu={handleContextMenu}>
        <Pointer
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          size={lineSize}
          ref={pointerRef}
        />
        <Canvas
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          ref={canvasRef}
        />
      </Board>
    </Container>
  )
}

export default BoardComponent
