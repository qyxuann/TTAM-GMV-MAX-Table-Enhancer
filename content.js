// 等待页面加载完成
function waitForTable() {
  const targetTable = document.querySelector('.theme-arco-table-container');
  if (targetTable) {
    initializePlugin();
  } else {
    setTimeout(waitForTable, 100);
  }
}

// 初始化插件
function initializePlugin() {
  const targetTable = document.querySelector('.theme-arco-table-container');
  
  // 监听表格变化
  const observer = new MutationObserver((mutations) => {
    const container = document.querySelector('.theme-arco-table-container');
    if (container && container.classList.contains('expanded')) {
      expandTable();
    }
  });
  
  observer.observe(targetTable, {
    attributes: true,
    childList: true,
    subtree: true
  });
}

// 展开表格
function expandTable() {
  const container = document.querySelector('.theme-arco-table-container');
  const table = container.querySelector('table');
  const scrollContainer = document.querySelector('.theme-arco-table-content-scroll');
  
  // 保存原始样式
  if (!container.dataset.originalStyles) {
    container.dataset.originalStyles = JSON.stringify({
      width: container.style.width,
      maxWidth: container.style.maxWidth,
      transform: container.style.transform
    });
  }
  
  // 计算列宽
  const colWidths = Array.from(table.querySelectorAll('col')).reduce((sum, col) => {
    const width = parseInt(col.style.width || '0');
    return sum + (width > 0 ? width + 1 : 0);
  }, 0);
  
  // 设置样式
  container.style.width = (colWidths + 20) + 'px';
  container.style.maxWidth = 'none';
  scrollContainer.style.overflowX = 'visible';
  
  // 只处理数据单元格的固定列
  const fixedColumns = container.querySelectorAll('td.theme-arco-table-col-fixed-left');
  fixedColumns.forEach(col => {
    col.style.position = 'sticky';
    col.style.zIndex = '2';
    col.style.background = '#fff';
  });

  // 只设置表头的位置属性
  const fixedHeaders = container.querySelectorAll('th.theme-arco-table-col-fixed-left');
  fixedHeaders.forEach(header => {
    header.style.position = 'sticky';
    header.style.zIndex = '2';
  });
}

// 重置表格
function resetTable() {
  const container = document.querySelector('.theme-arco-table-container');
  const scrollContainer = document.querySelector('.theme-arco-table-content-scroll');
  
  // 恢复原始样式
  if (container.dataset.originalStyles) {
    const originalStyles = JSON.parse(container.dataset.originalStyles);
    Object.assign(container.style, originalStyles);
  } else {
    container.style.width = '';
    container.style.maxWidth = '';
    container.style.transform = '';
  }
  
  scrollContainer.style.overflowX = 'auto';
  
  // 重置所有固定列样式
  const allFixedColumns = container.querySelectorAll('.theme-arco-table-col-fixed-left');
  allFixedColumns.forEach(col => {
    if (col.tagName.toLowerCase() === 'td') {
      // 只清除数据单元格的样式
      col.style.removeProperty('position');
      col.style.removeProperty('z-index');
      col.style.removeProperty('background');
    }
  });
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const container = document.querySelector('.theme-arco-table-container');
  
  switch (request.action) {
    case 'toggleExpand':
      const isExpanded = container.classList.toggle('expanded');
      if (isExpanded) {
        expandTable();
      } else {
        resetTable();
      }
      sendResponse({ isExpanded });
      break;
      
    case 'setScale':
      const scale = request.scale / 100;
      container.style.transform = `scale(${scale})`;
      sendResponse({ success: true });
      break;
  }
  
  return true;
});

// 启动插件
waitForTable();