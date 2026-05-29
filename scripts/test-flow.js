const BASE_URL = 'http://localhost:3001';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}═══ ${msg} ═══${colors.reset}`),
  step: (msg) => console.log(`\n${colors.yellow}→ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}  ✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}  ❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`  ${colors.cyan}${msg}${colors.reset}`),
};

let passed = 0;
let failed = 0;
let state = {};

const assert = (condition, message) => {
  if (condition) {
    log.success(message);
    passed++;
  } else {
    log.error(message);
    failed++;
  }
};

const request = async (method, path, body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const json = await res.json();
  return { status: res.status, data: json.data, json };
};

const get = (path) => request('GET', path);
const post = (path, body) => request('POST', path, body);
const patch = (path, body) => request('PATCH', path, body);
const del = (path) => request('DELETE', path);

const testFlow = async () => {
  // Check server
  log.section('Verificando servidor');
  try {
    const health = await get('/');
    assert(health.status === 200 && (health.json?.message === 'CutLog API funcionando'), 'Servidor corriendo');
  } catch {
    log.error('No se pudo conectar al servidor. Ejecutá: pnpm dev');
    process.exit(1);
  }

  // 1. Dimensions
  log.section('1. Dimensions');
  const dimensions = await get('/api/dimensions');
  assert(dimensions.status === 200, `GET /api/dimensions → ${dimensions.status}`);
  assert(Array.isArray(dimensions.data) && dimensions.data.length > 0, `Seed tiene ${dimensions.data.length} dimensiones`);
  state.dim1 = dimensions.data[0];
  state.dim2 = dimensions.data[1];
  state.dim1Str = `${dimensions.data[0].thickness}x${dimensions.data[0].width}x${dimensions.data[0].length}`;
  state.dim2Str = `${dimensions.data[1].thickness}x${dimensions.data[1].width}x${dimensions.data[1].length}`;
  log.info(`Dimensión 1: ${state.dim1Str}`);
  log.info(`Dimensión 2: ${state.dim2Str}`);

  // 2. StackConfigs
  log.section('2. StackConfigs');
  const stackConfigs = await get('/api/stack-configs');
  assert(stackConfigs.status === 200, `GET /api/stack-configs → ${stackConfigs.status}`);
  assert(Array.isArray(stackConfigs.data) && stackConfigs.data.length > 0, `${stackConfigs.data.length} configuraciones de apilado`);

  // 3. Create order
  log.section('3. Crear Orden');
  const orderRes = await post('/api/orders', {
    client: 'Aserradero Central',
    orderDate: '29-05-2026',
    dimensions: [
      { dimensionId: state.dim1.id, quantity: 5 },
      { dimensionId: state.dim2.id, quantity: 3 },
    ],
  });
  assert(orderRes.status === 201, `POST /api/orders → ${orderRes.status}`);
  assert(orderRes.data.status === 'pending', `Orden creada con status "pending"`);
  assert(orderRes.data.dimensions?.length === 2, `Orden tiene 2 dimensiones`);
  state.order = orderRes.data;
  log.info(`Orden #${state.order.id}: ${state.order.client}`);

  // 4. Get order (verify produced/pending/status)
  log.section('4. Ver Orden (sin bundles)');
  const orderDetail = await get(`/api/orders/${state.order.id}`);
  assert(orderDetail.status === 200, `GET /api/orders/${state.order.id} → ${orderDetail.status}`);
  assert(orderDetail.data.dimensions[0].produced === 0, 'Item 1: produced = 0');
  assert(orderDetail.data.dimensions[0].pending === 5, 'Item 1: pending = 5');
  assert(orderDetail.data.dimensions[0].status === 'not_started', 'Item 1: status = not_started');
  assert(orderDetail.data.dimensions[0].stackConfig, 'Item 1: tiene stackConfig');
  log.info(`Item 1: ${orderDetail.data.dimensions[0].dimension} → ${orderDetail.data.dimensions[0].quantity} pedidos, ${orderDetail.data.dimensions[0].produced} producidos`);

  // 5. Add item to order
  log.section('5. Agregar Item a Orden');
  const addItemRes = await post(`/api/orders/${state.order.id}/items`, {
    items: [{ dimensionId: state.dim1.id, quantity: 10 }],
  });
  assert(addItemRes.status === 201, `POST /api/orders/${state.order.id}/items → ${addItemRes.status}`);
  const updatedOrder = addItemRes.data;
  const dim1Item = updatedOrder.dimensions.find((d) => d.dimension === state.dim1Str);
  assert(dim1Item.quantity === 15, `Dimensión 1: quantity sumó 5+10 = ${dim1Item.quantity}`);
  state.item1Id = dim1Item.itemId;
  log.info(`Dimensión ${state.dim1Str}: itemId=${state.item1Id}, ahora ${dim1Item.quantity} paquetes`);

  // 6. Register bundles
  log.section('6. Registrar Bundles');
  const bundle1 = await post(`/api/orders/${state.order.id}/items/${state.item1Id}/bundles`);
  assert(bundle1.status === 201, `POST bundle 1 → ${bundle1.status}`);
  assert(bundle1.data.dimension, 'Bundle tiene dimension aplanada');
  assert(bundle1.data.stackConfig, 'Bundle tiene stackConfig aplanado');
  assert(bundle1.data.totalPieces > 0, `Bundle tiene totalPieces = ${bundle1.data.totalPieces}`);
  assert(bundle1.data.cubicMeters > 0, `Bundle tiene cubicMeters = ${bundle1.data.cubicMeters}`);
  log.info(`Bundle 1: ${bundle1.data.dimension} con ${bundle1.data.stackConfig} → ${bundle1.data.totalPieces} piezas`);

  const bundle2 = await post(`/api/orders/${state.order.id}/items/${state.item1Id}/bundles`);
  assert(bundle2.status === 201, `POST bundle 2 → ${bundle2.status}`);
  log.info(`Bundle 2 registrado`);

  // 7. Verify order after bundles
  log.section('7. Ver Orden (con bundles)');
  const orderAfterBundles = await get(`/api/orders/${state.order.id}`);
  assert(orderAfterBundles.status === 200, `GET orden actualizada → ${orderAfterBundles.status}`);
  const dim1After = orderAfterBundles.data.dimensions.find((d) => d.dimension === state.dim1Str);
  assert(dim1After.produced === 2, `Dimensión 1: produced = 2 (2 bundles)`);
  assert(dim1After.pending === 13, `Dimensión 1: pending = 15-2 = ${dim1After.pending}`);
  assert(dim1After.status === 'in_progress', `Dimensión 1: status = in_progress`);
  log.info(`Dimensión ${dim1After.dimension}: ${dim1After.produced}/${dim1After.quantity} producidos → ${dim1After.status}`);

  // 8. Stock global
  log.section('8. Stock Global');
  const stock = await get('/api/stock');
  assert(stock.status === 200, `GET /api/stock → ${stock.status}`);
  assert(Array.isArray(stock.data) && stock.data.length > 0, `Stock tiene ${stock.data.length} dimensiones`);
  const stockDim1 = stock.data.find((s) => s.dimension === state.dim1Str);
  assert(stockDim1, `Stock incluye dimensión ${state.dim1Str}`);
  assert(stockDim1.totalOrdered === 15, `Stock: totalOrdered = 15`);
  assert(stockDim1.totalProduced === 2, `Stock: totalProduced = 2`);
  assert(stockDim1.totalPending === 13, `Stock: totalPending = 13`);
  assert(stockDim1.orders.length === 1, `Stock: 1 orden para esta dimensión`);
  log.info(`Stock ${stockDim1.dimension}: ${stockDim1.totalOrdered} pedidos, ${stockDim1.totalProduced} producidos, ${stockDim1.totalPending} pendientes`);

  // 9. Update bundle stackConfig
  log.section('9. Actualizar Bundle (cambiar stackConfig)');
  const updatedBundle = await patch(`/api/bundles/${bundle1.data.id}`, { stackConfigId: 2 });
  assert(updatedBundle.status === 200, `PATCH /api/bundles/${bundle1.data.id} → ${updatedBundle.status}`);
  assert(updatedBundle.data.stackConfig, 'Bundle actualizado tiene stackConfig');
  log.info(`Bundle ${bundle1.data.id}: stackConfig actualizado a ${updatedBundle.data.stackConfig}`);

  // 10. Delete and restore
  log.section('10. Soft Delete y Restore');
  const deletedBundle = await del(`/api/bundles/${bundle2.data.id}`);
  assert(deletedBundle.status === 200, `DELETE bundle → ${deletedBundle.status}`);

  const restoredBundle = await post(`/api/bundles/${bundle2.data.id}/restore`);
  assert(restoredBundle.status === 200, `POST restore bundle → ${restoredBundle.status}`);

  // Summary
  log.section('Resumen');
  console.log(`\n${colors.bold}Pruebas pasadas: ${colors.green}${passed}${colors.reset}`);
  console.log(`${colors.bold}Pruebas fallidas: ${colors.red}${failed}${colors.reset}`);
  console.log(`${colors.bold}Total: ${passed + failed}${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
};

testFlow().catch((err) => {
  log.error(`Error fatal: ${err.message}`);
  process.exit(1);
});
