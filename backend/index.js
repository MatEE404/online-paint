import { fileURLToPath } from "url"
import { createServer } from "http"
import { Server } from "socket.io"
import express from "express"
import path from "path"

const app = express()
const server = createServer(app)
const io = new Server(server)

const PORT = process.env.PORT || 8000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const clients = []
let canvas = null

io.on("connection", (client) => {
  clients.push(client)

  if (canvas) client.emit("canvas", canvas)

  io.emit("players", clients.length)

  console.log(`Client joined server: ${client.id}`)

  client.on("update", (newCanvas) => {
    canvas = newCanvas
    client.broadcast.emit("canvas", canvas)
  })

  client.on("disconnect", () => {
    clients.splice(clients.indexOf(client), 1)

    io.emit("players", clients.length)

    console.log(`Client left server: ${client.id}`)
  })
})

app.use(express.static(path.join(__dirname, "../frontend/build")))

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname + "/../frontend/build/index.html"))
})

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
