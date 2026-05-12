# Metrored Nutrition Planner

Generador de planes nutricionales personalizados basado en valoración in-situ.

## Características

- Cálculos clínicos (TMB, TDEE, macronutrientes)
- Planes nutricionales personalizados
- Planes de ejercicio (gimnasio o casa)
- Envío automático de planes por correo vía Microsoft 365

## Configuración Rápida

### 1. Completar credenciales Azure

Edita `wrangler.toml`:
```toml
AZURE_TENANT_ID = "tu-tenant-id-aqui"
AZURE_CLIENT_ID = "tu-client-id-aqui"
AZURE_SENDER = "agente@metrored.com"
```

### 2. Instalar dependencias

```bash
npm install -g wrangler
npm install
```

### 3. Agregar secret

```bash
wrangler secret put AZURE_CLIENT_SECRET
# (pega tu client_secret)
```

### 4. Desplegar

#### Frontend (Cloudflare Pages):
```bash
# GitHub → Cloudflare Pages se configura automáticamente
git push origin main
```

#### Worker (API):
```bash
wrangler pages deploy worker.js --project-name metrored-nutrition-worker
```

## URLs Después del Despliegue

- Frontend: https://metrored-nutrition-planner.pages.dev
- Worker: https://metrored-nutrition-worker.pages.dev
- GitHub: https://github.com/tu-usuario/metrored-nutrition-planner

## Archivos Importantes

- `index.html` - App principal (todo en uno)
- `worker.js` - API para enviar correos (Cloudflare Worker)
- `wrangler.toml` - Configuración Cloudflare
- `package.json` - Dependencias npm

## Desarrollo Local

```bash
npm run dev
```

Abre http://localhost:8000

## Estructura

```
metrored-nutrition-planner/
├── index.html          # App web principal
├── worker.js           # Cloudflare Worker API
├── package.json        # Dependencias npm
├── wrangler.toml       # Config Cloudflare + variables Azure
├── .gitignore          # Git ignore
├── README.md           # Este archivo
└── DEPLOY_PASO_A_PASO.md  # Guía completa de despliegue
```

## Cómo Funciona

1. Usuario completa formulario de valoración in-situ
2. App calcula TMB, TDEE, macronutrientes
3. Genera plan completo (comidas + ejercicio)
4. Usuario puede descargar o enviar por correo
5. Click en "Enviar correo" → llama al Worker
6. Worker obtiene token Azure de forma segura
7. Worker envía correo vía Microsoft Graph
8. ✓ Correo llega al paciente

## Seguridad

- Client secret de Azure está **cifrado en Cloudflare**
- No se expone en el navegador
- Worker actúa como proxy seguro
- CORS habilitado en Worker

## Soporte

Ver `DEPLOY_PASO_A_PASO.md` para:
- Instalación completa
- Configuración Azure
- Despliegue en Cloudflare
- Troubleshooting

---

**Versión**: 1.0  
**Para**: Metrored Centros Médicos  
**Actualizado**: Mayo 2026
