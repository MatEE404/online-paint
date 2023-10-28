import { createServer } from "http"
import { Server } from "socket.io"

const server = createServer()
const io = new Server(server)

const clients = []
let canvas = null

io.on("connection", (client) => {
  clients.push(client)

  if (canvas) client.emit("canvas", canvas)

  console.log(`Client joined server: ${client.id}`)

  client.on("update", (newCanvas) => {
    canvas = newCanvas
    client.broadcast.emit("canvas", canvas)
  })

  client.on("disconnect", () => {
    clients.splice(clients.indexOf(client), 1)

    console.log(`Client left server: ${client.id}`)
  })
})

io.listen(8000)
