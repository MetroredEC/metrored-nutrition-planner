# 🚀 METRORED NUTRITION PLANNER - DESPLIEGUE COMPLETO

## ¿Qué necesitas?

1. **Cuenta GitHub** (gratis): https://github.com/signup
2. **Cuenta Cloudflare** (gratis): https://dash.cloudflare.com/signup  
3. **Credenciales Azure** del Agente de Conocimiento Metrored:
   - `AZURE_TENANT_ID`
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `AZURE_SENDER` (correo del agente, ej: agente@metrored.com)

---

## PASO 1: Crear Repositorio en GitHub

```bash
# 1. Ve a https://github.com/new
# 2. Nombre del repositorio: metrored-nutrition-planner
# 3. Descripción: Generador de planes nutricionales personalizados
# 4. Selecciona: PUBLIC (importante)
# 5. Click "Create repository"
```

Una vez creado, GitHub te dará una URL como:
```
https://github.com/tu-usuario/metrored-nutrition-planner
```

---

## PASO 2: Clonar y Preparar Localmente

```bash
# En tu máquina, abre PowerShell o CMD

# Navega a la carpeta donde quieres el proyecto
cd C:\Users\tu-usuario\Desktop

# Clona el repositorio (GitHub te dará este comando exacto)
git clone https://github.com/tu-usuario/metrored-nutrition-planner.git
cd metrored-nutrition-planner

# Crea la estructura de carpetas necesaria
mkdir src
mkdir public
```

---

## PASO 3: Copiar Archivos del Proyecto

Copia estos 3 archivos que descargaste a la carpeta `metrored-nutrition-planner`:

**En la raíz del proyecto:**
```
metrored-nutrition-planner/
├── index.html                  ← index.html (renombra si es necesario)
├── worker.js                   ← worker.js
├── package.json                ← (próximo paso)
├── wrangler.toml               ← (próximo paso)
├── .gitignore                  ← (próximo paso)
└── README.md                   ← (próximo paso)
```

---

## PASO 4: Crear package.json

En la raíz del proyecto, crea un archivo llamado `package.json`:

```json
{
  "name": "metrored-nutrition-planner",
  "version": "1.0.0",
  "description": "Generador de planes nutricionales personalizados",
  "type": "module",
  "scripts": {
    "dev": "http-server -p 8000 -c-1",
    "build": "echo 'No build needed for static site'",
    "deploy": "wrangler pages deploy ."
  },
  "devDependencies": {
    "http-server": "^14.1.1",
    "wrangler": "^3.0.0"
  }
}
```

---

## PASO 5: Crear wrangler.toml

En la raíz, crea `wrangler.toml` (este es el config para Cloudflare):

```toml
name = "metrored-nutrition-planner"
type = "javascript"
account_id = ""
workers_dev = true

[build]
command = "echo 'Static site'"
cwd = "./"

[env.production]
name = "metrored-nutrition-planner-prod"

# AQUÍ VAN TUS CREDENCIALES AZURE (variables públicas)
[vars]
AZURE_TENANT_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
AZURE_CLIENT_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
AZURE_SENDER = "agente@metrored.com"

# El client_secret se agrega después como secret cifrado
```

---

## PASO 6: Crear .gitignore

En la raíz, crea `.gitignore`:

```
node_modules/
.env
.env.local
.DS_Store
*.log
dist/
.wrangler/
```

---

## PASO 7: Crear README.md

En la raíz, crea `README.md`:

```markdown
# Metrored Nutrition Planner

Generador de planes nutricionales personalizados basado en valoración in-situ.

## Características

- Cálculos clínicos (TMB, TDEE, macronutrientes)
- Planes nutricionales personalizados
- Planes de ejercicio (gimnasio o casa)
- Envío automático de planes por correo vía Microsoft 365

## Desarrollo Local

```bash
npm install
npm run dev
```

Abre http://localhost:8000

## Despliegue

Se despliega automáticamente a Cloudflare Pages al hacer push a GitHub.

URL: https://metrored-nutrition-planner.pages.dev
```

---

## PASO 8: Hacer Git Commit Inicial

```bash
# En PowerShell/CMD dentro de la carpeta del proyecto

git add .
git commit -m "Initial commit: Metrored Nutrition Planner"
git branch -M main
git remote add origin https://github.com/tu-usuario/metrored-nutrition-planner.git
git push -u origin main
```

---

## PASO 9: Conectar Cloudflare Pages a GitHub

1. Ve a https://dash.cloudflare.com
2. En el sidebar izquierdo: **Pages**
3. Click **"Create a project"**
4. Click **"Connect to Git"**
5. Autoriza Cloudflare para acceder a GitHub
6. Selecciona el repositorio: **metrored-nutrition-planner**
7. Click **"Begin setup"**

### Configurar Build:
```
Build command:       (dejar vacío - es un sitio estático)
Build output folder: (dejar vacío)
```

8. Click **"Save and Deploy"**

Cloudflare automáticamente:
- Clona tu repo
- Despliega los archivos
- Te genera una URL como: https://metrored-nutrition-planner.pages.dev

---

## PASO 10: Desplegar el Worker (API de Correos)

El Worker maneja seguramente el envío de correos. Sigue estos pasos:

### A. Instalar Wrangler localmente

```bash
npm install -g @cloudflare/wrangler
```

### B. Autenticar con Cloudflare

```bash
wrangler login
```

(Esto abre un navegador para que autorices Wrangler)

### C. Actualizar wrangler.toml con tus credenciales

En `wrangler.toml`, completa los valores de Azure:

```toml
[vars]
AZURE_TENANT_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"    # ← TU TENANT ID
AZURE_CLIENT_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"    # ← TU CLIENT ID
AZURE_SENDER = "agente@metrored.com"                        # ← TU EMAIL
```

### D. Agregar el Secret Cifrado

```bash
wrangler secret put AZURE_CLIENT_SECRET
```

(Te pedirá que pegues el client_secret - esto lo cifra automáticamente)

### E. Desplegar el Worker

```bash
wrangler pages deploy worker.js --project-name metrored-nutrition-worker
```

Este comando despliega el Worker en:
```
https://metrored-nutrition-worker.pages.dev
```

---

## PASO 11: Actualizar index.html con la URL del Worker

En `index.html`, busca esta línea:

```javascript
const WORKER_URL = 'https://metrored-nutrition-worker.pages.dev';
```

Reemplaza con la URL real que obtuviste en el paso anterior.

Luego haz commit:

```bash
git add index.html
git commit -m "Update Worker URL"
git push origin main
```

---

## PASO 12: Prueba el Envío de Correos

1. Abre tu app: https://metrored-nutrition-planner.pages.dev
2. Completa un plan nutricional
3. Click en "✉ Enviar por correo"
4. Ingresa tu correo y click en "Enviar →"

Deberías recibir el plan en tu correo en 10-30 segundos ✓

---

## 🔐 Notas de Seguridad

- El `AZURE_CLIENT_SECRET` está **cifrado en Cloudflare** y **nunca se expone** en el navegador
- El Worker actúa como proxy seguro entre tu aplicación y Microsoft Graph
- Todas las llamadas a Microsoft Graph se hacen desde el Worker, no desde el navegador

---

## 📋 Checklist Final

- [ ] ✓ Repo creado en GitHub
- [ ] ✓ Archivos copiados localmente
- [ ] ✓ package.json creado
- [ ] ✓ wrangler.toml creado con credenciales Azure
- [ ] ✓ .gitignore creado
- [ ] ✓ README.md creado
- [ ] ✓ Git commit inicial hecho
- [ ] ✓ Cloudflare Pages conectado a GitHub
- [ ] ✓ Sitio desplegado en: https://metrored-nutrition-planner.pages.dev
- [ ] ✓ Wrangler instalado y autenticado
- [ ] ✓ Worker deployado en: https://metrored-nutrition-worker.pages.dev
- [ ] ✓ index.html actualizado con URL del Worker
- [ ] ✓ Prueba de envío de correo exitosa

---

## 🚀 ¡Listo!

Tu aplicación está 100% funcional:
- ✓ Interfaz en línea (Cloudflare Pages)
- ✓ Envío automático de correos (Cloudflare Worker)
- ✓ Autenticación con Azure/Microsoft 365
- ✓ Almacenamiento en GitHub

---

## 📞 Si hay problemas

### "El Worker no funciona"
```bash
# Ver logs del Worker
wrangler tail metrored-nutrition-worker
```

### "El correo no llega"
1. Verifica que el email de destino sea correcto
2. Revisa los logs del Worker (arriba)
3. Asegúrate de que las credenciales Azure sean correctas

### "La página muestra error de CORS"
- El Worker maneja los headers de CORS automáticamente
- Si aún tienes problemas, revisa los logs

---

**Versión**: 1.0  
**Actualizado**: 12 de mayo de 2026  
**Para**: Metrored Centros Médicos
