// Exportación de reportes en el navegador. Las librerías se cargan solo al exportar
// (import dinámico) para no engrosar la carga inicial de la aplicación.
const nombreArchivo = (base, desde, hasta, ext) => `${base}_${desde}_${hasta}.${ext}`;

/**
 * @param {{ base: string, titulo: string, desde: string, hasta: string,
 *           columnas: string[], filas: (string|number)[][] }} reporte
 */
export async function exportarPDF({ base, titulo, desde, hasta, columnas, filas }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFontSize(14);
  doc.text(titulo, 14, 18);
  doc.setFontSize(10);
  doc.text(`Mesa Abierta · Período: ${desde} a ${hasta}`, 14, 25);
  autoTable(doc, {
    head: [columnas],
    body: filas.map((f) => f.map(String)),
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [31, 111, 80] },
  });
  doc.save(nombreArchivo(base, desde, hasta, 'pdf'));
}

export async function exportarExcel({ base, desde, hasta, columnas, filas }) {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const encabezado = columnas.map((c) => ({ value: c, fontWeight: 'bold' }));
  const cuerpo = filas.map((f) => f.map((v) => ({ value: v })));
  await writeExcelFile([encabezado, ...cuerpo]).toFile(nombreArchivo(base, desde, hasta, 'xlsx'));
}
