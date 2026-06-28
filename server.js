const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3002

app.use(cors())
app.use(express.json())

const DATA_DIR = path.join(__dirname, 'src', 'data')

// 获取所有数据文件列表
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
    res.json(files.map(f => f.replace('.json', '')))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 读取指定文件
app.get('/api/data/:name', (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.name}.json`)
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    res.json(JSON.parse(data))
  } catch (err) {
    res.status(404).json({ error: '文件不存在' })
  }
})

// 保存指定文件
app.put('/api/data/:name', (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.name}.json`)
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})