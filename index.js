import express from 'express'
// import { invite } from './discord/index.js'

const app = express()
const port = 3003

app.use(express.json())

app.post('/invite', function (req, res) {
  const { i } = req.body
  // console.log(req.body)
  res.json(req.headers)
})

app.post('/hello', function (req, res) {
  const { i } = req.body
  // console.log(req.body)
  res.json(req.headers)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
