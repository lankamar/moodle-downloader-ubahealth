# EDET Organizer Module 📁
## Documentación del Sistema de Organización para Seminarios EDET

### Descripción General

El módulo **EDET Organizer** es una extensión funcional de Moodle Downloader que proporciona:

1. **Organización automática** de los 7 seminarios del EDET
2. **Integración con NotebookLM** para procesamiento de recursos con IA
3. **Creación de carpetas RAG** (Retrieval-Augmented Generation) personalizadas
4. **Sincronización automática** de recursos descargados

### Los 7 Seminarios EDET

El sistema gestiona automáticamente la siguiente estructura:

| Seminario | Carpeta | Descripción |
|-----------|---------|-------------|
| 1 | `EDET_Seminario_01` | Introducción a EDET |
| 2 | `EDET_Seminario_02` | Fundamentos |
| 3 | `EDET_Seminario_03` | Conceptos Clínicos |
| 4 | `EDET_Seminario_04` | Práctica |
| 5 | `EDET_Seminario_05` | Casos Clínicos |
| 6 | `EDET_Seminario_06` | Evaluación |
| 7 | `EDET_Seminario_07` | Integración Final |

### Estructura de Archivos

```
src/
├── edet-organizer.js      # Lógica principal del organizador
├── edet-config.html       # UI del panel de configuración
├── edet-config.js         # Lógica de interacción del UI
└── EDET_README.md        # Este archivo
```

### API del Módulo

#### `EDETOrganizer.initialize()`
Inicializa la estructura de carpetas EDET.

```javascript
const result = await EDETOrganizer.initialize();
// result: { success: true, mainFolderId: '...', seminarsCount: 7 }
```

#### `EDETOrganizer.connectNotebookLM(seminarioId)`
Conecta NotebookLM con un seminario específico.

```javascript
const result = await EDETOrganizer.connectNotebookLM(3);
// Conecta NotebookLM con Seminario 3
```

#### `EDETOrganizer.organizeResources(files, seminarioId)`
Organiza archivos descargados en la carpeta del seminario.

```javascript
const organized = await EDETOrganizer.organizeResources(fileList, 2);
// Organiza los archivos en EDET_Seminario_02
```

#### `EDETOrganizer.getStatus()`
Obtiene el estado actual de inicialización.

```javascript
const status = await EDETOrganizer.getStatus();
// { initialized: true, lastSync: '...', seminars: [...] }
```

#### `EDETOrganizer.getSeminars()`
Obtiene la lista de seminarios.

```javascript
const seminarios = EDETOrganizer.getSeminars();
// Array de 7 seminarios con su configuración
```

### Características de NotebookLM

**Integración Automática**
- Sincronización de recursos con Google NotebookLM
- Indexación automática de documentos
- Generación de análisis con IA

**RAG (Retrieval-Augmented Generation)**
- Búsqueda semántica en documentos
- Respuestas contextualmente relevantes
- Mejora continua con nuevos recursos

### Configuración Avanzada

El panel de configuración permite:

1. **Organización automática**: Organizar recursos al descargar
2. **Habilitar RAG**: Activar búsqueda inteligente
3. **Sincronización con Google Drive**: Backup automático

### Almacenamiento

La información se almacena en:

- **Chrome Storage Sync**: Configuraciones y metadatos
- **LocalStorage**: Estructura de carpetas local
- **Google Drive** (opcional): Backup y sincronización

### Ejemplo de Uso Completo

```javascript
// 1. Inicializar
await EDETOrganizer.initialize();

// 2. Conectar NotebookLM al Seminario 1
await EDETOrganizer.connectNotebookLM(1);

// 3. Descargar recursos desde Moodle
const files = await downloadMoodleResources();

// 4. Organizar automáticamente
await EDETOrganizer.organizeResources(files, 1);

// 5. Consultar estado
const status = await EDETOrganizer.getStatus();
console.log('Seminarios procesados:', status.seminars.length);
```

### Requisitos

- Chrome v90+
- Acceso a Google Drive (para sincronización)
- Cuenta de Google NotebookLM
- Permisos de lectura/escritura en carpetas

### Troubleshooting

| Problema | Solución |
|----------|----------|
| Carpetas no se crean | Verificar permisos de Drive |
| NotebookLM no conecta | Reiniciar la extensión |
| Archivos no se organizan | Confirmar seminario seleccionado |

### Versión

- **Versión EDET**: 1.0.0
- **Compatible con**: Moodle Downloader v4.9+
- **Licencia**: MIT

### Soporte

Para reportar problemas o contribuir mejoras:
1. Abre un issue en el repositorio
2. Proporciona pasos para reproducir
3. Incluye logs de la consola del navegador

---

**Desarrollado por**: lankamar (UBA Medical Education)
**Última actualización**: Enero 2026
