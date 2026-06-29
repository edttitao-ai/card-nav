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

// 访问统计（累加访问量）
app.post('/api/data/stats', (req, res) => {
  const filePath = path.join(DATA_DIR, 'stats.json')
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    // 累加总访问量
    data.totalVisits = (data.totalVisits || 0) + 1
    // 更新当天访问量
    const today = new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace('/', '-')
    const todayEntry = data.last7Days.find(d => d.date === today)
    if (todayEntry) {
      todayEntry.count++
    } else {
      data.last7Days.push({ date: today, count: 1 })
      if (data.last7Days.length > 7) data.last7Days.shift()
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
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

// 追加日志记录
app.post('/api/data/:name', (req, res) => {
  if (req.params.name !== 'logs') {
    return res.status(400).json({ error: '仅支持 logs' })
  }
  const filePath = path.join(DATA_DIR, 'logs.json')
  try {
    let logs = []
    if (fs.existsSync(filePath)) {
      logs = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
    logs.unshift(req.body) // 新记录添加到开头
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})