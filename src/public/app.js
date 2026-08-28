// ==================== 天气功能 ====================
const WEATHER_API_KEY = '4d8fb5b93d4af21d66a2948710284366'; // OpenWeatherMap免费API Key

// 天气图标映射
const weatherIcons = {
    '01d': 'bi-sun-fill',
    '01n': 'bi-moon-fill',
    '02d': 'bi-cloud-sun-fill',
    '02n': 'bi-cloud-moon-fill',
    '03d': 'bi-cloud-fill',
    '03n': 'bi-cloud-fill',
    '04d': 'bi-clouds-fill',
    '04n': 'bi-clouds-fill',
    '09d': 'bi-cloud-drizzle-fill',
    '09n': 'bi-cloud-drizzle-fill',
    '10d': 'bi-cloud-rain-fill',
    '10n': 'bi-cloud-rain-fill',
    '11d': 'bi-cloud-lightning-fill',
    '11n': 'bi-cloud-lightning-fill',
    '13d': 'bi-snow-fill',
    '13n': 'bi-snow-fill',
    '50d': 'bi-cloud-haze-fill',
    '50n': 'bi-cloud-haze-fill'
};

// 获取用户位置并显示天气
async function initWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeather(latitude, longitude);
            },
            error => {
                console.error('获取位置失败:', error);
                // 默认使用北京的位置
                fetchWeather(39.9042, 116.4074);
                document.getElementById('locationName').textContent = '北京 (默认位置)';
            }
        );
    } else {
        // 浏览器不支持地理定位，使用默认位置
        fetchWeather(39.9042, 116.4074);
        document.getElementById('locationName').textContent = '北京 (默认位置)';
    }
}

// 获取天气数据
async function fetchWeather(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`
        );
        const data = await response.json();
        
        if (data.cod === 200) {
            updateWeatherUI(data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('获取天气失败:', error);
        document.getElementById('locationName').textContent = '天气获取失败';
        document.getElementById('temperature').textContent = '--°C';
        document.getElementById('weatherDesc').textContent = '请检查网络连接';
    }
}

// 更新天气UI
function updateWeatherUI(data) {
    const iconCode = data.weather[0].icon;
    const iconClass = weatherIcons[iconCode] || 'bi-cloud-sun-fill';
    
    document.getElementById('weatherIcon').className = `bi ${iconClass}`;
    document.getElementById('locationName').textContent = data.name || '当前位置';
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    
    // 更新天气详情（适配新UI结构）
    const weatherDetails = document.getElementById('weatherDetails');
    weatherDetails.innerHTML = `
        <span><i class="bi bi-droplet"></i> ${data.main.humidity}%</span>
        <span><i class="bi bi-wind"></i> ${data.wind.speed} m/s</span>
    `;
}

// ==================== 排序功能 ====================
const sortForm = document.getElementById('sortForm');
const numbersInput = document.getElementById('numbersInput');
const sortResult = document.getElementById('sortResult');

sortForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const inputText = numbersInput.value.trim();
    if (!inputText) {
        showAlert('请输入要排序的数值！', 'warning');
        return;
    }
    
    // 解析输入的数字（支持逗号、空格、换行分隔）
    const numbers = inputText
        .split(/[,\s\n]+/)
        .filter(n => n.trim() !== '');
    
    // 获取排序方式
    const order = document.querySelector('input[name="sortOrder"]:checked').value;
    
    try {
        const response = await fetch('/api/sort', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ numbers, order })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displaySortResult(data);
        } else {
            showAlert(data.error, 'danger');
        }
    } catch (error) {
        showAlert('排序服务请求失败: ' + error.message, 'danger');
    }
});

// 显示排序结果
function displaySortResult(data) {
    sortResult.classList.remove('d-none');
    document.getElementById('originalNumbers').textContent = data.original.join(', ');
    document.getElementById('sortedNumbers').textContent = data.sorted.join(', ');
    document.getElementById('sortOrderText').textContent = data.order;
    document.getElementById('numberCount').textContent = data.count;
}

// ==================== DeepSeek AI 问答功能 ====================
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatContainer = document.getElementById('chatContainer');
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleApiKey = document.getElementById('toggleApiKey');

// 切换API Key显示/隐藏
toggleApiKey.addEventListener('click', () => {
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
    toggleApiKey.innerHTML = type === 'password' 
        ? '<i class="bi bi-eye"></i>' 
        : '<i class="bi bi-eye-slash"></i>';
});

// 从localStorage加载API Key
if (localStorage.getItem('deepseek_api_key')) {
    apiKeyInput.value = localStorage.getItem('deepseek_api_key');
}

// 保存API Key到localStorage
apiKeyInput.addEventListener('change', () => {
    localStorage.setItem('deepseek_api_key', apiKeyInput.value);
});

// 发送消息
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    
    if (!message) {
        return;
    }
    
    if (!apiKey) {
        showAlert('请先输入DeepSeek API Key！', 'warning');
        apiKeyInput.focus();
        return;
    }
    
    // 添加用户消息
    addChatMessage(message, 'user');
    chatInput.value = '';
    
    // 添加加载动画
    const loadingId = addLoadingMessage();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message, apiKey })
        });
        
        const data = await response.json();
        
        // 移除加载动画
        removeLoadingMessage(loadingId);
        
        if (data.success) {
            addChatMessage(data.reply, 'assistant');
        } else {
            addChatMessage('错误: ' + data.error, 'system');
        }
    } catch (error) {
        removeLoadingMessage(loadingId);
        addChatMessage('请求失败: ' + error.message, 'system');
    }
});

// 添加聊天消息
function addChatMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    
    let formattedContent;
    if (type === 'assistant') {
        // AI回复使用Markdown渲染
        formattedContent = renderMarkdown(content);
    } else if (type === 'user') {
        // 用户消息转义HTML
        formattedContent = escapeHtml(content);
    } else {
        // 系统消息
        formattedContent = content;
    }
    
    messageDiv.innerHTML = `
        <div class="message-bubble markdown-body">${formattedContent}</div>
    `;
    
    // 高亮代码块
    if (type === 'assistant') {
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            if (window.hljs) {
                hljs.highlightElement(block);
            }
        });
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 渲染Markdown
function renderMarkdown(text) {
    if (typeof marked !== 'undefined') {
        // 配置marked
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (window.hljs && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {}
                }
                return code;
            }
        });
        return marked.parse(text);
    }
    return escapeHtml(text);
}

// 添加加载消息
function addLoadingMessage() {
    const id = 'loading-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message assistant';
    messageDiv.id = id;
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <span class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </span>
        </div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

// 移除加载消息
function removeLoadingMessage(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示提示框
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initWeather();
    
    // 手动获取位置按钮
    const refreshLocationBtn = document.getElementById('refreshLocationBtn');
    refreshLocationBtn.addEventListener('click', () => {
        refreshLocationBtn.disabled = true;
        refreshLocationBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                    resetRefreshButton();
                },
                error => {
                    console.error('获取位置失败:', error);
                    showAlert('获取位置失败，请检查浏览器位置权限', 'warning');
                    resetRefreshButton();
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            showAlert('您的浏览器不支持地理定位', 'danger');
            resetRefreshButton();
        }
    });
    
    function resetRefreshButton() {
        refreshLocationBtn.disabled = false;
        refreshLocationBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
    }
});
