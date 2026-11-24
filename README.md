# Plataforma educativa · Strategic Intelligence Firm

Campus de la Academia SIF: programas, materiales, aula, agenda, perfil y administración del CEO.

## Arrancar en Ubuntu

Hace falta [Node.js 22](https://nodejs.org) o más nuevo y Git.

```bash
git clone https://github.com/sifintelligence-repos/plataforma_educativa_oficial.git
cd plataforma_educativa_oficial
bash scripts/arrancar.sh
```

Abrí [http://localhost:8080](http://localhost:8080).

## Arrancar en Windows

1. Instalá [Node.js 22](https://nodejs.org) y [Git](https://git-scm.com/download/win).
2. Abrí PowerShell en la carpeta donde quieras el proyecto y ejecutá:

```powershell
git clone https://github.com/sifintelligence-repos/plataforma_educativa_oficial.git
cd plataforma_educativa_oficial
scripts\arrancar.bat
```

Abrí [http://localhost:8080](http://localhost:8080).

## Instalarla en la laptop

Con el campus abierto en Chrome o Edge:

- **Windows:** menú del navegador → Instalar app, o el ícono de instalar en la barra de direcciones.
- **Ubuntu:** menú de Chrome → Guardar y compartir → Instalar página como app.

Queda un acceso directo. El servidor (`npm run dev` o el `.bat`) tiene que estar prendido en esa computadora.

## Primera cuenta

Creá la cuenta con el Gmail `direccion.sif@gmail.com` y una clave de al menos 8 caracteres. Esa cuenta entra como CEO y ve Dirección.

Cualquier otro Gmail entra como estudiante de Desarrollador en Python. En esta copia local no pide código de confirmación si corrés `npm run dev`.

Los Gmail fijos de dirección y las cifras del canal se editan en `src/lib/academy.config.ts`. Los programas y precios están en `src/lib/catalog.ts`.

## Datos

Sin una base externa, la app usa una base embebida que vive mientras el servidor está abierto. Si apagás la laptop, las cuentas de esa sesión no quedan. Para guardarlas de verdad, creá una base Postgres y arrancá así:

```bash
DATABASE_URL="postgres://usuario:clave@localhost:5432/sif" npm run dev
```

En Windows PowerShell:

```powershell
$env:DATABASE_URL="postgres://usuario:clave@localhost:5432/sif"
npm run dev
```

## Más adelante: App Store y Play Store

Hoy es una app web instalable. Para las tiendas de Apple y Google el paso siguiente es envolverla con Capacitor (un proyecto iOS y otro Android que abren este mismo campus). Eso pide Mac para la App Store y las cuentas de desarrollador de Apple y Google. No hace falta reescribir las pantallas.
