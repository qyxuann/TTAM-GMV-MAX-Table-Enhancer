// 获取当前标签页
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// 初始化控制面板
document.addEventListener('DOMContentLoaded', async () => {
  const tab = await getCurrentTab();
  
  // 展开按钮点击事件
  document.getElementById('expandBtn').addEventListener('click', async () => {
    const btn = document.getElementById('expandBtn');
    chrome.tabs.sendMessage(tab.id, { action: 'toggleExpand' }, (response) => {
      if (response && response.isExpanded) {
        btn.textContent = '还原表格';
      } else {
        btn.textContent = '展开表格';
      }
    });
  });

  // 缩放控制
  document.getElementById('scaleSlider').addEventListener('input', (e) => {
    const scale = e.target.value;
    document.getElementById('scaleValue').textContent = scale + '%';
    chrome.tabs.sendMessage(tab.id, { 
      action: 'setScale', 
      scale: scale 
    });
  });
}); 