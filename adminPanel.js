import { getContent, saveContent, resetContent } from './siteContent.js';
import { ADMIN_PASSWORD } from './password.js';

let currentData = {};
let activeTab = 'hero';

export function renderAdminPanel(container) {
  // Check auth
  if (!sessionStorage.getItem('admin_auth')) {
    container.innerHTML = `
      <div class="admin-login">
        <div class="admin-login-card glass-card">
          <h2>🔒 Admin Panel</h2>
          <p>Enter the password to access the content manager</p>
          <div id="login-error" class="admin-login-error"></div>
          <input type="password" id="admin-password" placeholder="••••••" />
          <button id="login-btn" class="btn btn-primary" style="width: 100%">Unlock</button>
        </div>
      </div>
    `;

    document.getElementById('login-btn').addEventListener('click', () => {
      const pswd = document.getElementById('admin-password').value;
      if (pswd === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', 'true');
        renderEditor(container);
      } else {
        document.getElementById('login-error').textContent = 'Incorrect password. Try again.';
      }
    });

    // Press enter support
    document.getElementById('admin-password').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('login-btn').click();
    });
    return;
  }

  renderEditor(container);
}

function renderEditor(container) {
  currentData = getContent();

  const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'nav', label: 'Navigation' },
    { id: 'stats', label: 'Stats' },
    { id: 'services', label: 'Services' },
    { id: 'why', label: 'Why Drywall' },
    { id: 'about', label: 'About' },
    { id: 'discounts', label: 'Discounts' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' },
    { id: 'footer', label: 'Footer' },
    { id: 'colors', label: '🎨 Colors' },
  ];

  container.innerHTML = `
    <div class="admin-panel">
      <div class="admin-header">
        <h1>📋 Content <span>Manager</span></h1>
        <div class="admin-actions">
          <button id="preview-btn" class="btn btn-outline">👁 Preview</button>
          <button id="reset-btn" class="btn btn-outline" style="border-color: #e74c3c; color: #e74c3c;">↺ Reset</button>
          <button id="save-btn" class="btn btn-primary">💾 Save</button>
        </div>
      </div>
      
      <div class="admin-tabs">
        ${tabs.map((t) => `<button class="admin-tab ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}
      </div>

      <div class="admin-content" id="admin-editor">
        <!-- Fields injected here based on active tab -->
      </div>
    </div>
  `;

  // Attach tab listeners
  document.querySelectorAll('.admin-tab').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.admin-tab').forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
      activeTab = e.target.dataset.tab;
      renderActiveTab();
    });
  });

  // Action listeners
  document.getElementById('save-btn').addEventListener('click', async () => {
    collectActiveTabData();
    
    // Always save to standard localStorage for preview/fallback
    saveContent(currentData);

    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '⏳ Saving...';
    saveBtn.disabled = true;

    try {
      // Post to Vercel Serverless Component
      const res = await fetch('/api/saveContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });
      
      if (res.ok) {
        showToast('Changes saved and deployed successfully!');
      } else {
        const err = await res.json();
        showToast('Error: ' + (err.error || 'Failed to save to server.'));
      }
    } catch (e) {
      console.error(e);
      showToast('Error connecting to server to save.');
    } finally {
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure? This will wipe all changes and restore original defaults.')) {
      currentData = resetContent();
      renderActiveTab();
      showToast('Content reset to defaults.');
    }
  });

  document.getElementById('preview-btn').addEventListener('click', () => {
    window.open(window.location.origin + '/', '_blank');
  });

  // Initial render
  renderActiveTab();
}



function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function renderActiveTab() {
  const editor = document.getElementById('admin-editor');
  collectActiveTabData(); // save previous state silently
  
  if (activeTab === 'colors') {
    renderColorsTab(editor);
  } else if (activeTab === 'services' || activeTab === 'testimonials' || activeTab === 'stats' || activeTab === 'why') {
    renderArrayTab(editor, activeTab);
  } else {
    renderObjectTab(editor, activeTab);
  }
}

// Automatically builds inputs for flat objects (Hero, Contact, About, etc)
function renderObjectTab(container, key) {
  const sectionData = currentData[key];
  if (!sectionData) return;

  let html = `<h3>Edit ${key.charAt(0).toUpperCase() + key.slice(1)} Section</h3><br>`;
  
  for (const [prop, val] of Object.entries(sectionData)) {
    if (Array.isArray(val) || typeof val === 'object') continue; // Skip complex for auto-builder
    
    html += `
      <div class="admin-field">
        <label>${prop.toUpperCase()}</label>
        ${val.length > 80 || prop.includes('description') 
          ? `<textarea data-key="${key}" data-prop="${prop}">${val}</textarea>` 
          : `<input type="text" data-key="${key}" data-prop="${prop}" value="${val.replace(/"/g, '&quot;')}" />`
        }
      </div>
    `;
  }
  container.innerHTML = html;
}

// Dedicated renderer for color pickers
function renderColorsTab(container) {
  const c = currentData.colors;
  let html = `<h3>Site Color Palette</h3><br>`;
  
  for (const [prop, val] of Object.entries(c)) {
    // Basic hex colors get color picker, rgba get text inputs
    const isHex = val.startsWith('#') && val.length <= 7;
    
    html += `
      <div class="admin-field">
        <label>${prop.toUpperCase().replace(/([A-Z])/g, ' $1')}</label>
        <div class="admin-color-row">
          ${isHex ? `<input type="color" data-key="colors" data-prop="${prop}" value="${val}" />` : ''}
          <input type="text" data-key="colors" data-prop="${prop}" value="${val}" ${isHex ? 'readonly style="width:120px;flex:none;background:transparent;border:none;"' : ''} />
        </div>
      </div>
    `;
  }
  container.innerHTML = html;

  // Sync color picker with companion text input
  container.querySelectorAll('input[type="color"]').forEach(picker => {
    picker.addEventListener('input', (e) => {
      e.target.nextElementSibling.value = e.target.value.toUpperCase();
    });
  });
}

// Handler for arrays of objects (Services, Testimonials)
function renderArrayTab(container, key) {
  const list = currentData[key].items || currentData[key].points; // Handles generic items array or 'points' array
  const arrayKey = currentData[key].items ? 'items' : 'points';
  let html = `<h3>Edit ${key.charAt(0).toUpperCase() + key.slice(1)} Items</h3><br>`;
  
  // Render section titles first if they exist
  if (currentData[key].sectionTitle !== undefined) {
    html += `
      <div class="admin-field">
        <label>SECTION TITLE</label>
        <input type="text" data-key="${key}" data-prop="sectionTitle" value="${currentData[key].sectionTitle}" />
      </div>
    `;
  }
  if (currentData[key].sectionSubtitle !== undefined) {
    html += `
      <div class="admin-field">
        <label>SECTION SUBTITLE</label>
        <input type="text" data-key="${key}" data-prop="sectionSubtitle" value="${currentData[key].sectionSubtitle}" />
      </div>
    `;
  }

  html += `<div id="array-container">`;
  
  list.forEach((item, i) => {
    html += `<div class="admin-array-item" data-index="${i}">
      <button class="admin-remove-btn" title="Remove Item">×</button>
      <h4>Item #${i + 1}</h4>
    `;
    
    for (const [prop, val] of Object.entries(item)) {
       html += `
        <div class="admin-field">
          <label>${prop.toUpperCase()}</label>
          ${val.length > 60 || prop === 'text' || prop === 'description'
            ? `<textarea data-array="${key}" data-array-key="${arrayKey}" data-index="${i}" data-prop="${prop}">${val}</textarea>` 
            : `<input type="text" data-array="${key}" data-array-key="${arrayKey}" data-index="${i}" data-prop="${prop}" value="${val.replace(/"/g, '&quot;')}" />`
          }
        </div>
      `;
    }
    html += `</div>`;
  });

  html += `</div><button id="add-item-btn" class="admin-add-btn">+ Add New Item</button>`;
  container.innerHTML = html;

  // Array actions
  container.querySelectorAll('.admin-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.closest('.admin-array-item').dataset.index;
      collectActiveTabData(); // save current text
      currentData[key][arrayKey].splice(idx, 1);
      renderActiveTab(); // re-render
    });
  });

  document.getElementById('add-item-btn').addEventListener('click', () => {
    collectActiveTabData();
    // clone shape of first item
    if (list.length > 0) {
      const shape = { ...list[0] };
      for (let k in shape) shape[k] = '';
      currentData[key][arrayKey].push(shape);
      renderActiveTab();
    }
  });
}

function collectActiveTabData() {
  const container = document.getElementById('admin-editor');
  if (!container) return;

  // Standard flat fields
  container.querySelectorAll('input[data-key], textarea[data-key]').forEach(el => {
    const key = el.dataset.key;
    const prop = el.dataset.prop;
    if (key && prop) {
      currentData[key][prop] = el.value;
    }
  });

  // Array fields
  container.querySelectorAll('input[data-array], textarea[data-array]').forEach(el => {
    const key = el.dataset.array;
    const arrayKey = el.dataset.arrayKey;
    const idx = el.dataset.index;
    const prop = el.dataset.prop;
    if (key && arrayKey && idx && prop) {
      if (currentData[key] && currentData[key][arrayKey] && currentData[key][arrayKey][idx]) {
        currentData[key][arrayKey][idx][prop] = el.value;
      }
    }
  });
}
