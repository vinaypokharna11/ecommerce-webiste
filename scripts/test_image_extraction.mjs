import JSZip from 'jszip';
import ExcelJS from 'exceljs';

async function run() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Products');
  ws.columns = [
    { header: 'Product Name', key: 'name', width: 25 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Price', key: 'price', width: 10 },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Image 1', key: 'image_1', width: 20 },
    { header: 'Image 2', key: 'image_2', width: 20 },
    { header: 'Image 3', key: 'image_3', width: 20 },
  ];

  ws.addRow({ name: 'Floral Night Dress', sku: 'FD001', price: 799, stock: 20 });
  ws.addRow({ name: 'Black Night Suit', sku: 'NS002', price: 999, stock: 15 });

  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const img1 = wb.addImage({ base64: pngBase64, extension: 'png' });
  const img2 = wb.addImage({ base64: pngBase64, extension: 'png' });
  const img3 = wb.addImage({ base64: pngBase64, extension: 'png' });

  // Row 1 (Excel Row 2, Product 1): Image 1 (col 4), Image 2 (col 5)
  ws.addImage(img1, { tl: { col: 4, row: 1 }, ext: { width: 40, height: 40 } });
  ws.addImage(img2, { tl: { col: 5, row: 1 }, ext: { width: 40, height: 40 } });

  // Row 2 (Excel Row 3, Product 2): Image 1 (col 4)
  ws.addImage(img3, { tl: { col: 4, row: 2 }, ext: { width: 40, height: 40 } });

  const buf = await wb.xlsx.writeBuffer();

  // Test extraction with JSZip
  const zip = await JSZip.loadAsync(buf);
  const results = [];

  for (const path of Object.keys(zip.files)) {
    if (!path.startsWith('xl/drawings/drawing') || !path.endsWith('.xml')) continue;

    const drawingXml = await zip.files[path].async('string');
    const relsPath = path.replace('xl/drawings/', 'xl/drawings/_rels/') + '.rels';
    const relsXml = zip.files[relsPath] ? await zip.files[relsPath].async('string') : '';

    const rIdToTarget = {};
    const relRegex = /<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g;
    let m;
    while ((m = relRegex.exec(relsXml)) !== null) {
      let target = m[2];
      if (target.startsWith('../')) target = 'xl/' + target.slice(3);
      else if (!target.startsWith('xl/')) target = 'xl/drawings/' + target;
      rIdToTarget[m[1]] = target;
    }

    const anchorRegex = /<xdr:(?:twoCellAnchor|oneCellAnchor)[\s\S]*?<\/xdr:(?:twoCellAnchor|oneCellAnchor)>/g;
    const anchors = drawingXml.match(anchorRegex) || [];

    for (const anchor of anchors) {
      const fromMatch = anchor.match(/<xdr:from>[\s\S]*?<xdr:col>(\d+)<\/xdr:col>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/);
      const blipMatch = anchor.match(/<a:blip[^>]+r:embed="([^"]+)"/);

      if (fromMatch && blipMatch) {
        const col = parseInt(fromMatch[1], 10);
        const row = parseInt(fromMatch[2], 10);
        const rId = blipMatch[1];
        const targetPath = rIdToTarget[rId];

        if (targetPath && zip.files[targetPath]) {
          const imgBytes = await zip.files[targetPath].async('uint8array');
          results.push({
            row0: row,
            col0: col,
            excelRow: row + 1,
            excelCol: col + 1,
            targetPath,
            size: imgBytes.length
          });
        }
      }
    }
  }

  console.log('SUCCESS! Extracted images:', results);
}

run().catch(console.error);
