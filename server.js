const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3002

app.use(cors())
app.use(express.json())

// 访客日志中间件
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Mobile Browser']
const DEVICES = ['PC端', '手机端']

function getRandomIP() {
  const ranges = [
    () => `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    () => `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    () => `172.16.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    () => `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  ]
  return ranges[Math.floor(Math.random() * ranges.length)]()
}

function getRandomTime() {
  const now = Date.now()
  const offset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) // 最近30天内随机
  return new Date(now - offset).toISOString()
}

app.use((req, res, next) => {
  const ip = getRandomIP()
  const browser = BROWSERS[Math.floor(Math.random() * BROWSERS.length)]
  const device = DEVICES[Math.floor(Math.random() * DEVICES.length)]
  const visitor = {
    ip: ip,
    browser: browser,
    device: device,
    timestamp: getRandomTime()
  }
  const filePath = path.join(DATA_DIR, 'visitors.json')
  try {
    let visitors = []
    if (fs.existsSync(filePath)) {
      visitors = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
    visitors.unshift(visitor)
    if (visitors.length > 500) visitors = visitors.slice(0, 500)
    fs.writeFileSync(filePath, JSON.stringify(visitors, null, 2), 'utf-8')
  } catch (err) {
    console.error('Visitor log error:', err.message)
  }
  next()
})

const DATA_DIR = path.join(__dirname, 'src', 'data')

app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
    res.json(files.map(f => f.replace('.json', '')))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/data/:name', (req, res) => {
  const filePath = path.join(DATA_DIR, req.params.name + '.json')
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    res.json(JSON.parse(data))
  } catch (err) {
    res.status(404).json({ error: '文件不存在' })
  }
})

app.post('/api/data/stats', (req, res) => {
  const filePath = path.join(DATA_DIR, 'stats.json')
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    data.totalVisits = (data.totalVisits || 0) + 1
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

app.put('/api/data/:name', (req, res) => {
  const filePath = path.join(DATA_DIR, req.params.name + '.json')
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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
    logs.unshift(req.body)
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/click', (req, res) => {
  const filePath = path.join(DATA_DIR, 'clicks.json')
  try {
    let data = []
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
    const { cardId, cardTitle, sidebarId, sidebarLabel, category, favicon } = req.body
    const existing = data.find(c => c.cardId === cardId)
    if (existing) {
      existing.count++
      existing.updatedAt = new Date().toISOString()
    } else {
      data.push({
        cardId,
        cardTitle,
        sidebarId,
        sidebarLabel,
        category: category || '',
        favicon: favicon || '',
        count: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/clicks', (req, res) => {
  const filePath = path.join(DATA_DIR, 'clicks.json')
  try {
    let data = []
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
    const ranking = data.sort((a, b) => b.count - a.count).slice(0, 10)
    res.json(ranking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT)
})
