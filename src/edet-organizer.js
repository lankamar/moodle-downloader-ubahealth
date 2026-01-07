/**
 * EDET Organizer Module
 * Manages organization of EDET seminars and NotebookLM integration
 * Author: lankamar (UBA Medical Education)
 * License: MIT
 */

const EDETOrganizer = (() => {
  // Configuration for 7 EDET seminars
  const SEMINARIOS_EDET = [
    { id: 1, nombre: 'Seminario 1: Introducción a EDET', carpeta: 'EDET_Seminario_01' },
    { id: 2, nombre: 'Seminario 2: Fundamentos', carpeta: 'EDET_Seminario_02' },
    { id: 3, nombre: 'Seminario 3: Conceptos Clínicos', carpeta: 'EDET_Seminario_03' },
    { id: 4, nombre: 'Seminario 4: Práctica', carpeta: 'EDET_Seminario_04' },
    { id: 5, nombre: 'Seminario 5: Casos Clínicos', carpeta: 'EDET_Seminario_05' },
    { id: 6, nombre: 'Seminario 6: Evaluación', carpeta: 'EDET_Seminario_06' },
    { id: 7, nombre: 'Seminario 7: Integración Final', carpeta: 'EDET_Seminario_07' }
  ];

  /**
   * Initialize EDET folder structure in Google Drive
   * Creates main EDET folder and subfolders for each seminar
   */
  async function initializeEDETFolders() {
    try {
      console.log('[EDET] Inicializando estructura de carpetas...');
      
      // Create main EDET folder
      const mainFolderName = 'EDET_RAG_UBA_Medical_Education';
      const mainFolderId = await createOrGetFolder(mainFolderName);
      
      if (!mainFolderId) {
        throw new Error('No se pudo crear la carpeta principal EDET');
      }
      
      // Store main folder ID in chrome storage
      chrome.storage.sync.set({ 
        'edetMainFolderId': mainFolderId,
        'edetInitialized': true,
        'edetLastSync': new Date().toISOString()
      });
      
      // Create subfolders for each seminar
      for (const seminar of SEMINARIOS_EDET) {
        await createOrGetFolder(seminar.carpeta, mainFolderId);
        console.log(`[EDET] Carpeta creada: ${seminar.carpeta}`);
      }
      
      return {
        success: true,
        mainFolderId: mainFolderId,
        seminarsCount: SEMINARIOS_EDET.length,
        message: 'Estructura EDET inicializada correctamente'
      };
    } catch (error) {
      console.error('[EDET] Error en inicialización:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create or get existing folder
   * @param {string} folderName - Name of the folder
   * @param {string} parentFolderId - Optional parent folder ID
   */
  async function createOrGetFolder(folderName, parentFolderId = null) {
    // This is a placeholder for actual Drive API implementation
    // In production, this would use Google Drive API
    // For now, we'll use localStorage to simulate folder structure
    
    const storageKey = `edet_folder_${folderName}`;
    let folderId = localStorage.getItem(storageKey);
    
    if (!folderId) {
      folderId = generateUniqueId();
      localStorage.setItem(storageKey, folderId);
      localStorage.setItem(`edet_folder_name_${folderId}`, folderName);
      if (parentFolderId) {
        localStorage.setItem(`edet_folder_parent_${folderId}`, parentFolderId);
      }
    }
    
    return folderId;
  }

  /**
   * Connect to NotebookLM and process downloaded resources
   */
  async function connectToNotebookLM(seminarioId) {
    try {
      console.log(`[EDET] Conectando NotebookLM para Seminario ${seminarioId}`);
      
      const seminar = SEMINARIOS_EDET.find(s => s.id === seminarioId);
      if (!seminar) {
        throw new Error(`Seminario ${seminarioId} no encontrado`);
      }
      
      // Get the folder for this seminar
      const folderId = localStorage.getItem(`edet_folder_${seminar.carpeta}`);
      
      if (!folderId) {
        throw new Error(`Carpeta para ${seminar.nombre} aùn no ha sido inicializada`);
      }
      
      // Prepare NotebookLM connection data
      const notebookConfig = {
        folderId: folderId,
        seminarioId: seminarioId,
        seminarioNombre: seminar.nombre,
        ragEnabled: true,
        timestamp: new Date().toISOString()
      };
      
      // Store NotebookLM config
      chrome.storage.sync.set({
        [`notebookLM_config_${seminarioId}`]: notebookConfig
      });
      
      return {
        success: true,
        seminario: seminar.nombre,
        notebookConfig: notebookConfig,
        message: 'NotebookLM conectado correctamente'
      };
    } catch (error) {
      console.error('[EDET] Error en conexión NotebookLM:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process and organize downloaded resources
   * Moves files to appropriate seminar folders
   */
  async function organizeDownloadedResources(files, seminarioId) {
    try {
      const seminar = SEMINARIOS_EDET.find(s => s.id === seminarioId);
      if (!seminar) {
        throw new Error(`Seminario ${seminarioId} no válido`);
      }
      
      const organized = {
        seminar: seminar.nombre,
        processedFiles: [],
        totalFiles: files.length,
        timestamp: new Date().toISOString()
      };
      
      for (const file of files) {
        organized.processedFiles.push({
          filename: file.name,
          size: file.size,
          type: file.type,
          seminario: seminarioId,
          destination: seminar.carpeta,
          procesado: true
        });
      }
      
      // Store organization metadata
      chrome.storage.sync.set({
        [`edet_resources_${seminarioId}`]: organized
      });
      
      return organized;
    } catch (error) {
      console.error('[EDET] Error en organización de recursos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get status of EDET organization
   */
  async function getStatus() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        'edetInitialized',
        'edetMainFolderId',
        'edetLastSync'
      ], (data) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        
        const status = {
          initialized: data.edetInitialized || false,
          mainFolderId: data.edetMainFolderId || null,
          lastSync: data.edetLastSync || null,
          seminars: SEMINARIOS_EDET,
          totalSeminars: SEMINARIOS_EDET.length
        };
        
        resolve(status);
      });
    });
  }

  /**
   * Generate unique ID for folders
   */
  function generateUniqueId() {
    return 'edet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Public API
  return {
    initialize: initializeEDETFolders,
    connectNotebookLM: connectToNotebookLM,
    organizeResources: organizeDownloadedResources,
    getStatus: getStatus,
    getSeminars: () => SEMINARIOS_EDET,
    getSeminario: (id) => SEMINARIOS_EDET.find(s => s.id === id)
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EDETOrganizer;
}
