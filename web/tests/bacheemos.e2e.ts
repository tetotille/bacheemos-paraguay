import { test, expect } from '@playwright/test';

test.describe('Bacheemos Paraguay - Suite de Pruebas E2E', () => {

  test('1. Mapa Principal de Baches (/)', async ({ page }) => {
    await page.goto('/');

    // Verificar título y estructura Sahara
    await expect(page).toHaveTitle(/Bacheemos Paraguay/i);
    await expect(page.locator('.brand-title')).toHaveText('Bacheemos');
    await expect(page.locator('.brand-subtitle')).toHaveText(/Infraestructura Vial/i);

    // Barra de control y buscador
    const searchInput = page.locator('.search-input');
    await expect(searchInput).toBeVisible();

    // Filtros de severidad presentes
    await expect(page.locator('button:has-text("Crítico")')).toBeVisible();
    await expect(page.locator('button:has-text("Alto")')).toBeVisible();

    // Panel lateral de incidentes en vista
    const incidentSidebar = page.locator('.incidents-sidebar');
    await expect(incidentSidebar).toBeVisible();
    await expect(incidentSidebar.locator('.sidebar-title')).toHaveText('Incidentes en Vista');

    // Incidentes listados
    const incidentCards = page.locator('.incident-item-card');
    await expect(incidentCards.first()).toBeVisible();

    // MapLibre Canvas renderizado con dimensiones reales
    const mapCanvas = page.locator('.map-viewport canvas.maplibregl-canvas');
    await expect(mapCanvas).toBeVisible();
    const canvasBox = await mapCanvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBeGreaterThan(400);
    expect(canvasBox!.height).toBeGreaterThan(300);

    // Interacción: Centrar en incidente y abrir popup de detalle
    await incidentCards.first().click();
    const marker = page.locator('.custom-pin').first();
    await expect(marker).toBeVisible();

    await marker.click();
    const popup = page.locator('.bache-popup-card');
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('Ver Ficha Completa');
  });

  test('2. Galería Visual (/galeria)', async ({ page }) => {
    await page.goto('/galeria');

    // Título editorial
    await expect(page.locator('h1')).toHaveText(/Galería Visual de Baches/i);

    // Pestañas de estado
    await expect(page.locator('button:has-text("Todos")')).toBeVisible();
    await expect(page.locator('button:has-text("Críticos")')).toBeVisible();
    await expect(page.locator('button:has-text("Pendientes")')).toBeVisible();
    await expect(page.locator('button:has-text("En Reparación")')).toBeVisible();
    await expect(page.locator('button:has-text("Resueltos")')).toBeVisible();

    // Tarjetas de baches renderizadas
    const bacheCards = page.locator('.bache-card');
    await expect(bacheCards.first()).toBeVisible();
    await expect(bacheCards.first().locator('.bache-code')).toBeVisible();
    await expect(bacheCards.first().locator('.badge-sev')).toBeVisible();

    // Botón de exportación GeoJSON
    const exportBtn = page.locator('button:has-text("Exportar GeoJSON")');
    await expect(exportBtn).toBeVisible();
  });

  test('3. Expediente & Ficha Técnica (/bache/BCH-2026-0981)', async ({ page }) => {
    await page.goto('/bache/BCH-2026-0981');

    // Título y código
    await expect(page.locator('h1')).toContainText('Expediente:');

    // Tarjetas de volumen y material
    await expect(page.locator('.m-title:has-text("Profundidad")')).toBeVisible();
    await expect(page.locator('.m-title:has-text("Área Dañada")')).toBeVisible();
    await expect(page.locator('.m-title:has-text("Volumen Relleno")')).toBeVisible();
    await expect(page.locator('.m-title:has-text("Severidad Vial")')).toBeVisible();

    // Prescripción de mezcla recomendada
    await expect(page.locator('.prescription-box')).toBeVisible();
    await expect(page.locator('.prescription-box')).toContainText(/Concreto asfáltico/i);

    // Timeline de 5 fases
    const timeline = page.locator('.timeline-stepper');
    await expect(timeline).toBeVisible();
    await expect(timeline.locator('.timeline-step')).toHaveCount(5);

    // Mini-mapa RTK con canvas renderizado
    const miniMapCanvas = page.locator('.mini-map-box canvas.maplibregl-canvas');
    await expect(miniMapCanvas).toBeVisible();
    const miniBox = await miniMapCanvas.boundingBox();
    expect(miniBox).not.toBeNull();
    expect(miniBox!.height).toBeGreaterThan(100);

    // Enlaces de navegación a Google Maps y Waze
    await expect(page.locator('a:has-text("Google Maps")')).toBeVisible();
    await expect(page.locator('a:has-text("Waze")')).toBeVisible();
  });

  test('4. Dashboard Ejecutivo & Métricas (/dashboard)', async ({ page }) => {
    await page.goto('/dashboard');

    // Título del dashboard
    await expect(page.locator('h1')).toHaveText(/Dashboard Ejecutivo/i);

    // 4 KPIs de red vial
    await expect(page.locator('.kpi-label:has-text("Baches Activos")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("Tiempo Reparación (MTTR)")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("Asfalto en Caliente Req.")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("Salud de Red Vial")')).toBeVisible();

    // Gráfico de evolución operativa
    await expect(page.locator('.bars-chart-wrapper')).toBeVisible();

    // Tabla de top corredores críticos
    const corredoresTable = page.locator('.table-sahara');
    await expect(corredoresTable).toBeVisible();
    await expect(corredoresTable.locator('tbody tr')).toHaveCount(4);
  });

  test('5. Validación & Eficacia del Modelo IA (/ia)', async ({ page }) => {
    await page.goto('/ia');

    // Título del módulo pericial
    await expect(page.locator('h1')).toHaveText(/Validación & Eficacia del Modelo IA/i);

    // KPIs de inferencia
    await expect(page.locator('.kpi-label:has-text("mAP@50 Global")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("MAE Profundidad")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("Falsos Positivos")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("Latencia Inferencia")')).toBeVisible();

    // Matriz de confusión normalizada (4x4)
    const matrixTable = page.locator('.matrix-table');
    await expect(matrixTable).toBeVisible();
    await expect(matrixTable.locator('.matrix-cell')).toHaveCount(16);

    // Curva PR
    await expect(page.locator('.pr-chart-svg-box svg')).toBeVisible();
  });

  test('6. Flujo de Reporte Ciudadano Anónimo (/reportar)', async ({ page }) => {
    await page.goto('/reportar');

    // Título
    await expect(page.locator('h1')).toHaveText(/Reportar Afectación Vial/i);

    // Mini-mapa selector de geolocalización con canvas renderizado
    const pickerMapCanvas = page.locator('.mini-picker-map canvas.maplibregl-canvas');
    await expect(pickerMapCanvas).toBeVisible();
    const pickerBox = await pickerMapCanvas.boundingBox();
    expect(pickerBox).not.toBeNull();
    expect(pickerBox!.height).toBeGreaterThan(100);

    // Llenar formulario ciudadano
    await page.fill('#direccion-input', 'Av. Santísima Trinidad esq. Itapúa, Asunción');
    await page.fill('#desc-input', 'Bache profundo cerca de la parada de ómnibus');

    // Enviar reporte
    await page.click('button[type="submit"]');

    // Verificar pantalla de éxito con código generado
    await expect(page.locator('h2')).toHaveText(/¡Reporte Registrado con Éxito!/i);
    const trackingBadge = page.locator('.tracking-code-badge');
    await expect(trackingBadge).toBeVisible();
    await expect(trackingBadge).toContainText('BCH-2026-');
  });

  test('7. Acceso Técnico (/login)', async ({ page }) => {
    await page.goto('/login');

    // Verificar formulario de inicio de sesión
    await expect(page.locator('h1')).toHaveText(/Acceso Técnico & Auditoría/i);
    await expect(page.locator('#email-input')).toBeVisible();
    await expect(page.locator('#password-input')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

});
