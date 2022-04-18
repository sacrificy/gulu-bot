import express from 'express'
import { twitter } from './twitter/index.js'

const app = express()
const port = 3003

app.use(express.json())

app.post('/twitter', async function (req, res) {
  const { index, actionList } = req.body
  const result = await twitter(index, actionList)
  res.json(result)
})

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

server.setTimeout(300000);