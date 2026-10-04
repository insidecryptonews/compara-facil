# Compara Fácil

Comparador de productos de Amazon.es elegido por el visitante. Busca en Amazon, añade hasta cuatro productos y contrasta precio y características en una tabla lado a lado.

## Probar

Vista local desde la carpeta del proyecto:

```powershell
python -m http.server 8000
```

Abre `http://127.0.0.1:8000/`. El buscador abre Amazon.es; al añadir un producto, copia el nombre, precio y detalles que quieras comparar. La página no extrae catálogo ni precios de Amazon. Los datos se mantienen en memoria mientras la pestaña está abierta.

## Build

```powershell
node scripts/build-site.mjs https://URL
```

El build es `noindex` y queda cerrado a buscadores salvo que se habilite producción. Para un lanzamiento real también hacen falta los datos legales autorizados por el titular y su alta en Afiliados Amazon. El ID se añade a `site-config.js` solo cuando exista.

La búsqueda automática dentro de la propia web requiere acceso a Amazon Creators API y un backend para custodiar credenciales; ver [MONETIZATION.md](MONETIZATION.md).
