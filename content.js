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
  
  // 创建控制面板
  createControl();
  
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

// 创建控制面板
function createControl() {
  // 先移除已存在的控制面板
  const existingControl = document.querySelector('.table-enhancer-control');
  if (existingControl) {
    existingControl.remove();
  }

  const control = document.createElement('div');
  control.className = 'table-enhancer-control';
  control.innerHTML = `
    <button id="expandBtn" class="enhancer-btn">展开表格</button>
    <div class="scale-control">
      <input type="range" id="scaleSlider" min="50" max="100" value="100">
      <span id="scaleValue">100%</span>
    </div>
  `;
  
  document.body.appendChild(control);
  
  // 强制设置样式
  control.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 9999 !important;
  `;
  
  // 展开按钮事件
  document.getElementById('expandBtn').addEventListener('click', () => {
    const container = document.querySelector('.theme-arco-table-container');
    const isExpanded = container.classList.toggle('expanded');
    const btn = document.getElementById('expandBtn');
    
    if (isExpanded) {
      expandTable();
      btn.textContent = '还原表格';
    } else {
      resetTable();
      btn.textContent = '展开表格';
    }
  });
  
  // 缩放控制
  document.getElementById('scaleSlider').addEventListener('input', (e) => {
    const scale = e.target.value / 100;
    document.getElementById('scaleValue').textContent = e.target.value + '%';
    const container = document.querySelector('.theme-arco-table-container');
    container.style.transform = `scale(${scale})`;
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
  
  document.getElementById('scaleSlider').value = 100;
  document.getElementById('scaleValue').textContent = '100%';
}

// 启动插件
waitForTable();