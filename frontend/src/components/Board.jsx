import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { v4 as uuid } from "uuid"

import {
  TRANSLATE_REGEX,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  LINE_COLORS,
} from "../constants"
import { Container, Board, Pointer, Canvas } from "./Board.styled"
import { handleContextMenu } from "../utils"
import Loading from "./Loading"
import Players from "./Players"
import Panel from "./Panel"

const BoardComponent = () => {
  const [startPositionMouse, setStartPositionMouse] = useState({ x: 0, y: 0 })
  const [startPositionBoard, setStartPositionBoard] = useState({ x: 0, y: 0 })
  const [selectedColor, setSelectedColor] = useState(LINE_COLORS.at(-1))
  const [selectedTool, setSelectedTool] = useState("BRUCH")
  const [paintingID, setPaintingID] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMoving, setIsMoving] = useState(false)
  const [lineSize, setLineSize] = useState(16)
  const [players, setPlayers] = useState(1)
  const [changes, setChanges] = useState([])
  const [socket, setSocket] = useState()
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
    let { x, y, width, height } = canvasRef.current.getBoundingClientRect()
    let { clientX, clientY } = e

    if (
      clientX < x ||
      clientY < y ||
      clientX > width + x ||
      clientY > height + y
    ) {
      pointerRef.current.style.display = "none"
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

  const handleUpdate = (ctx, { x, y, color, size }) => {
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
    if (paintingID) return

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

    setIsLoading(false)
  }

  useEffect(() => {
    setIsLoading(true)

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
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}>
        <Pointer
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          size={lineSize}
          ref={pointerRef}
        />
        <Canvas width={BOARD_WIDTH} height={BOARD_HEIGHT} ref={canvasRef} />
      </Board>
    </Container>
  )
}

export default BoardComponent
