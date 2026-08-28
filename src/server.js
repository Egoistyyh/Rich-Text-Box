const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 排序Web服务API
app.post('/api/sort', (req, res) => {
    try {
        const { numbers, order } = req.body;
        
        if (!numbers || !Array.isArray(numbers)) {
            return res.status(400).json({ 
                success: false, 
                error: '请提供有效的数字数组' 
            });
        }

        // 过滤并转换为数字
        const numArray = numbers
            .map(n => parseFloat(n))
            .filter(n => !isNaN(n));

        if (numArray.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: '没有有效的数字可排序' 
            });
        }

        // 排序：asc 从小到大，desc 从大到小
        let sortedArray;
        if (order === 'desc') {
            sortedArray = numArray.sort((a, b) => b - a);
        } else {
            sortedArray = numArray.sort((a, b) => a - b);
        }

        res.json({
            success: true,
            original: numbers,
            sorted: sortedArray,
            order: order === 'desc' ? '从大到小' : '从小到大',
            count: sortedArray.length
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: '服务器内部错误: ' + error.message 
        });
    }
});

// DeepSeek API代理（避免前端暴露API Key）
app.post('/api/chat', async (req, res) => {
    try {
        const { message, apiKey } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                error: '请提供消息内容' 
            });
        }

        if (!apiKey) {
            return res.status(400).json({ 
                success: false, 
                error: '请提供DeepSeek API Key' 
            });
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: '你是一个有帮助的AI助手。' },
                    { role: 'user', content: message }
                ],
                stream: false
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ 
                success: false, 
                error: data.error.message || 'DeepSeek API错误' 
            });
        }

        res.json({
            success: true,
            reply: data.choices[0].message.content
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: '调用DeepSeek API失败: ' + error.message 
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 排序API: POST http://localhost:${PORT}/api/sort`);
    console.log(`🤖 聊天API: POST http://localhost:${PORT}/api/chat`);
});
