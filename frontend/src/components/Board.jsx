import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

import {
  TRANSLATE_REGEX,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  LINE_COLORS,
  TOOLS,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_SENSITIVITY,
} from "../constants"
import { Container, Board, Pointer, Canvas } from "./Board.styled"
import { handleContextMenu, getPosition, handleUpdate } from "../utils"
import Loading from "./Loading"
import Players from "./Players"
import Panel from "./Panel"

const BoardComponent = () => {
  const [startPositionMouse, setStartPositionMouse] = useState({ x: 0, y: 0 })
  const [startPositionBoard, setStartPositionBoard] = useState({ x: 0, y: 0 })
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 })
  const [selectedColor, setSelectedColor] = useState(LINE_COLORS.at(-1))
  const [selectedTool, setSelectedTool] = useState(TOOLS.Bruch)
  const [isPainting, setIsPainting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMoving, setIsMoving] = useState(false)
  const [lineSize, setLineSize] = useState(16)
  const [players, setPlayers] = useState(1)
  const [socket, setSocket] = useState()
  const [zoom, setZoom] = useState(1)
  const [ctx, setCtx] = useState()
  const pointerRef = useRef()
  const canvasRef = useRef()

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
      setIsPainting(true)
      setCurrentPosition(getPosition(e))
    }
  }

  const handleMouseUp = (e) => {
    if (e?.button === 2) {
      setIsMoving(false)
      setStartPositionMouse({ x: 0, y: 0 })
    } else {
      handleMouseMove(e)
      setIsPainting(false)
    }
  }

  const updatePointer = (e) => {
    let { x, y, width, height } = canvasRef.current.getBoundingClientRect()
    let client = getPosition(e)

    pointerRef.current.style.left = `${client.x - lineSize / 2}px`
    pointerRef.current.style.top = `${client.y - lineSize / 2}px`

    if (
      client.x < x ||
      client.y < y ||
      client.x > width + x ||
      client.y > height + y
    ) {
      pointerRef.current.style.display = "none"
    } else {
      pointerRef.current.style.display = "block"
    }
  }

  const handleMouseMove = (e) => {
    updatePointer(e)

    if (isPainting) {
      let { x, y } = canvasRef.current.getBoundingClientRect()

      const change = {
        size: lineSize,
        x0: currentPosition.x - x,
        y0: currentPosition.y - y,
        x1: getPosition(e).x - x,
        y1: getPosition(e).y - y,
        color: selectedTool === "RUBBER" ? "#fff" : selectedColor,
      }

      setCurrentPosition(getPosition(e))

      socket.emit("update", change)
      handleUpdate(ctx, change)
    } else if (isMoving) {
      let deltaX = startPositionMouse.x - getPosition(e).x
      let deltaY = startPositionMouse.y - getPosition(e).y

      let translate = `${startPositionBoard.x - deltaX}px, 
        ${startPositionBoard.y - deltaY}px`

      canvasRef.current.style.transform = `translate(${translate})`
    }
  }

  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      setZoom(zoom >= ZOOM_MAX ? ZOOM_MAX : zoom + ZOOM_SENSITIVITY)
    } else if (e.deltaY > 0) {
      setZoom(zoom <= ZOOM_MIN ? ZOOM_MIN : zoom - ZOOM_SENSITIVITY)
    }
  }

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d")
    setCtx(ctx)

    const options = { transports: ["websocket"] }
    const socket = io(process.env.REACT_APP_SERVER_URL, options)
    setSocket(socket)

    socket.on("players", (players) => setPlayers(players))
    socket.on("chnage", (data) => {
      if (data.length !== undefined) {
        for (const index in data) {
          handleUpdate(ctx, data[index])
        }
      } else {
        handleUpdate(ctx, data)
      }

      setIsLoading(false)
    })
  }, [])

  return (
    <Container onWheel={handleWheel} onMouseMove={handleMouseMove}>
      <Loading isLoading={isLoading} />
      <Players players={players} />
      <Panel
        lineSize={lineSize}
        selectedColor={selectedColor}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        setSelectedColor={setSelectedColor}
        setLineSize={setLineSize}
      />
      <Board
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}>
        <Pointer
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          size={lineSize}
          ref={pointerRef}
        />
        <Canvas
          zoom={zoom}
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          ref={canvasRef}
        />
      </Board>
    </Container>
  )
}

export default BoardComponent
