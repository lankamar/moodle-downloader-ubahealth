/**
 * EDET Config Module
 * UI logic for EDET Organizer configuration panel
 */

(function() {
  'use strict';

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', initializeUI);

  /**
   * Initialize the EDET configuration UI
   */
  async function initializeUI() {
    console.log('[EDET Config] Inicializando UI...');
    
    // Load seminarios into dropdown
    const seminarios = EDETOrganizer.getSeminars();
    const select = document.getElementById('selected-seminar');
    
    seminarios.forEach(seminar => {
      const option = document.createElement('option');
      option.value = seminar.id;
      option.textContent = seminar.nombre;
      select.appendChild(option);
    });
    
    // Render seminarios grid
    renderSeminarios(seminarios);
    
    // Load initial status
    await updateStatus();
    
    // Attach event listeners
    attachEventListeners();
  }

  /**
   * Render seminarios in a grid
   */
  function renderSeminarios(seminarios) {
    const container = document.getElementById('seminarios-list');
    container.innerHTML = '';
    
    seminarios.forEach(seminar => {
      const card = document.createElement('div');
      card.className = 'seminar-card';
      card.innerHTML = `
        <div class="seminar-number">${seminar.id}</div>
        <div class="seminar-name">${seminar.nombre}</div>
        <div class="seminar-folder">${seminar.carpeta}</div>
        <button class="seminar-btn" data-id="${seminar.id}">Seleccionar</button>
      `;
      container.appendChild(card);
      
      // Add click handler
      card.querySelector('.seminar-btn').addEventListener('click', () => {
        document.getElementById('selected-seminar').value = seminar.id;
        enableConnectButton();
      });
    });
  }

  /**
   * Attach event listeners to buttons
   */
  function attachEventListeners() {
    // Initialize button
    document.getElementById('init-btn').addEventListener('click', async () => {
      const btn = document.getElementById('init-btn');
      btn.disabled = true;
      btn.textContent = 'Inicializando...';
      
      const result = await EDETOrganizer.initialize();
      if (result.success) {
        showSuccess('Estructura EDET inicializada correctamente');
        updateStatus();
      } else {
        showError('Error: ' + result.error);
      }
      
      btn.disabled = false;
      btn.textContent = 'Inicializar Estructura EDET';
    });
    
    // Connect NotebookLM button
    document.getElementById('connect-notebook-btn').addEventListener('click', async () => {
      const seminarioId = parseInt(document.getElementById('selected-seminar').value);
      if (seminarioId === 0) {
        showError('Por favor selecciona un seminario');
        return;
      }
      
      const btn = document.getElementById('connect-notebook-btn');
      btn.disabled = true;
      btn.textContent = 'Conectando...';
      
      const result = await EDETOrganizer.connectNotebookLM(seminarioId);
      if (result.success) {
        showSuccess('NotebookLM conectado: ' + result.seminario);
        displayNotebookStatus(result);
      } else {
        showError('Error: ' + result.error);
      }
      
      btn.disabled = false;
      btn.textContent = '\ud83d\udd17 Conectar NotebookLM';
    });
    
    // Save configuration button
    document.getElementById('save-config-btn').addEventListener('click', saveConfiguration);
    
    // Seminar select change
    document.getElementById('selected-seminar').addEventListener('change', enableConnectButton);
  }

  /**
   * Enable/disable connect button based on selection
   */
  function enableConnectButton() {
    const select = document.getElementById('selected-seminar');
    const btn = document.getElementById('connect-notebook-btn');
    btn.disabled = select.value === '0';
  }

  /**
   * Update status from EDETOrganizer
   */
  async function updateStatus() {
    const status = await EDETOrganizer.getStatus();
    const statusDiv = document.getElementById('init-status');
    const statusText = document.getElementById('status-text');
    
    if (status.initialized) {
      statusDiv.className = 'status-indicator initialized';
      statusText.textContent = '✓ Inicializado';
      document.getElementById('init-btn').style.display = 'none';
      document.getElementById('last-sync').textContent = status.lastSync || 'Nunca';
    } else {
      statusDiv.className = 'status-indicator pending';
      statusText.textContent = 'No inicializado';
    }
  }

  /**
   * Display NotebookLM status message
   */
  function displayNotebookStatus(result) {
    const statusDiv = document.getElementById('notebook-status');
    statusDiv.className = 'status-message success';
    statusDiv.innerHTML = `
      <strong>Conectado:</strong> ${result.seminario}<br>
      <small>Folder ID: ${result.notebookConfig.folderId}</small>
    `;
  }

  /**
   * Save configuration
   */
  async function saveConfiguration() {
    const config = {
      autoOrganize: document.getElementById('auto-organize').checked,
      enableRAG: document.getElementById('enable-rag').checked,
      syncDrive: document.getElementById('sync-drive').checked,
      timestamp: new Date().toISOString()
    };
    
    chrome.storage.sync.set({ 'edetConfig': config }, () => {
      showSuccess('Configuración guardada exitosamente');
    });
  }

  /**
   * Show success message
   */
  function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'notification success';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

  /**
   * Show error message
   */
  function showError(message) {
    const div = document.createElement('div');
    div.className = 'notification error';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
  }
})();
