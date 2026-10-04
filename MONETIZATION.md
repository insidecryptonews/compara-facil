# Afiliación Amazon

- Flujo: visitante elige productos → abre sus fichas en Amazon.es mediante enlaces → Amazon atribuye una compra apta → puede pagarse una comisión.
- Amazon no paga por visitas. Las comisiones dependen de categoría, compras aptas y condiciones del programa; no se proyectan ingresos sin datos.
- El visitante selecciona los productos y añade los datos visibles que quiere comparar. No se raspa el catálogo ni se guardan precios fuera de Amazon.
- Enlaces etiquetados y divulgación oficial solo se activan al añadir el ID terminado en `-21` a `site-config.js`.
- Amazon solicita 3 compras aptas dentro de los primeros 180 días para revisar la solicitud inicial de Afiliados: [requisitos oficiales](https://afiliados.amazon.es/help/node/topic/G7MJTPEP9NC3YKMG).
- La búsqueda de catálogo dentro de la página requiere Amazon Creators API. Sus documentos indican que el creador debe estar inscrito en Afiliados y haber generado al menos 10 ventas cualificadas en los 30 días anteriores para solicitar acceso: [documentación oficial de Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/).
- Sin API aprobada, la página abre búsqueda en Amazon.es y ofrece un comparador manual, sin inventar resultados, valoraciones, imágenes ni precios.
- La tabla de tarifas cambia y depende de la categoría: [comisiones oficiales](https://afiliados.amazon.es/help/node/topic/GRXPHT8U84RAYDXZ).
- Si no hay compras aptas, el ingreso es 0 €.

## Publicidad de Google

- La versión preparada admite una unidad responsive de AdSense y solo carga el proveedor cuando `adsenseClient`, `adsenseSlot` y `adsenseConsentReady` están configurados en `site-config.js`.
- Aún no se ha añadido ID de editor, no hay anuncios sirviéndose y no se ha enviado una solicitud a AdSense. Google debe aprobar el sitio y proporcionar estos identificadores.
- En España y el EEE, antes de mostrar anuncios personalizados se requiere una CMP certificada por Google e integrada con TCF. Configúrala en AdSense y ofrece su mensaje de privacidad antes de activar el código: [requisitos oficiales de consentimiento](https://support.google.com/adsense/answer/13554116?hl=es).
- Google puede usar el contexto visible para decidir anuncios; eso implica que el código publicitario puede leer el texto mostrado en la comparativa. La política de privacidad lo explica. No se transmite la comparativa a Compara Fácil ni se guarda en servidor.
- La unidad está desactivada hasta que exista aprobación del sitio, código de editor, ID de unidad y CMP operativa. AdSense no garantiza anuncios concretos ni ingresos; su guía exige tener el sitio listado y copiar el código generado desde la cuenta: [configurar anuncios automáticos](https://support.google.com/adsense/answer/9261307?hl=es).
