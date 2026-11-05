<script lang="ts">
  import IconVerified from '~icons/material-symbols/verified';
  import IconArrowUpward from '~icons/material-symbols/arrow-upward';
  import IconHeight from '~icons/material-symbols/height';
  import IconFilterDrama from '~icons/material-symbols/filter-drama-outline';
  import IconPsychology from '~icons/material-symbols/psychology-outline';
  import IconSpeed from '~icons/material-symbols/speed';
  import IconFileDownload from '~icons/material-symbols/download';
  import IconHistory from '~icons/material-symbols/history';
  import IconCheckCircle from '~icons/material-symbols/check-circle-outline';

  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let modelo = $derived(data.modelo);
  let metricas = $derived(modelo.metricas || {});

  let autoValidacion = $state(true);

  const activeLearningCases = [
    {
      id: 'BCH-2026-0842',
      direccion: 'Av. Mariscal López esq. Kubitschek',
      prediccionIA: 'Bache Profundo (96.8%)',
      medicionLidar: '11.2 cm • 0.78 m²',
      groundTruth: 'Bache Profundo',
      estado: 'Validado'
    },
    {
      id: 'BCH-2026-0839',
      direccion: 'Av. Madame Lynch c/ Sinforiano Buzó',
      prediccionIA: 'Piel de Cocodrilo (84.1%)',
      medicionLidar: '3.4 cm • 1.25 m²',
      groundTruth: 'Piel de Cocodrilo',
      estado: 'Validado'
    },
    {
      id: 'BCH-2026-0835',
      direccion: 'Ruta Transchaco Km 12',
      prediccionIA: 'Desprendimiento (76.2%)',
      medicionLidar: '1.8 cm • 0.35 m²',
      groundTruth: 'Desgaste Superficial',
      estado: 'Re-etiquetado'
    }
  ];

  function exportarDictamen() {
    window.print();
  }
</script>

<div class="ia-page">
  <!-- Cabecera pericial Sahara -->
  <div class="is-flex is-justify-content-between is-align-items-start is-flex-wrap-wrap gap-3">
    <div>
      <span class="has-text-grey is-size-7 text-uppercase font-mono">
        Módulo de Auditoría Pericial & Active Learning
      </span>
      <h1 class="headline-serif is-size-3">Validación & Eficacia del Modelo IA</h1>
      <p class="has-text-grey is-size-7 mt-1">
        Banco de benchmark pericial para <strong>{modelo.nombre_version}</strong>. Contraste sistemático de inferencia neuronal volumétrica contra telemetría láser LiDAR de campo.
      </p>
    </div>

    <div class="is-flex is-align-items-center gap-2">
      <!-- Toggle Auto-Validación -->
      <label class="checkbox is-size-7 has-text-weight-semibold is-flex is-align-items-center gap-2">
        <input type="checkbox" bind:checked={autoValidacion} />
        <span>Auto-Validación (&gt;95%)</span>
      </label>

      <button class="button is-small is-sahara-outlined" onclick={exportarDictamen}>
        <IconFileDownload class="mr-1" />
        <span>Dictamen de Calibración</span>
      </button>
    </div>
  </div>

  <!-- Fila de 5 KPIs del Modelo -->
  <div class="columns is-variable is-3 mt-1">
    <div class="column">
      <div class="kpi-card">
        <div class="is-flex is-justify-content-between is-align-items-center">
          <span class="kpi-label">mAP@50 Global</span>
          <span class="tag is-success is-light is-rounded font-mono">
            <IconArrowUpward class="mr-1" /> +1.8%
          </span>
        </div>
        <div class="kpi-value">{metricas.map50 || 94.2}%</div>
        <div class="kpi-sub">
          <span>vs versión previa</span>
          <span class="font-mono">{metricas.map50_prev || 92.4}%</span>
        </div>
      </div>
    </div>

    <div class="column">
      <div class="kpi-card">
        <div class="is-flex is-justify-content-between is-align-items-center">
          <span class="kpi-label">MAE Profundidad</span>
          <span class="tag is-light is-rounded font-mono">±0.8 cm tol.</span>
        </div>
        <div class="kpi-value">±{metricas.mae_profundidad_cm || 0.4} <small class="is-size-6 has-text-grey font-body">cm</small></div>
        <div class="kpi-sub">
          <span>Error medio absoluto</span>
          <span class="has-text-success font-mono">Precisión sub-cm</span>
        </div>
      </div>
    </div>

    <div class="column">
      <div class="kpi-card">
        <div class="is-flex is-justify-content-between is-align-items-center">
          <span class="kpi-label">Falsos Positivos</span>
          <span class="tag is-light is-rounded font-mono">-0.9%</span>
        </div>
        <div class="kpi-value">{metricas.falsos_positivos_pct || 2.1}%</div>
        <div class="kpi-sub">
          <span>En sombras y juntas</span>
          <span class="has-text-grey font-mono">Filtro dual</span>
        </div>
      </div>
    </div>

    <div class="column">
      <div class="kpi-card">
        <div class="is-flex is-justify-content-between is-align-items-center">
          <span class="kpi-label">Confianza Media</span>
          <span class="tag is-info is-light is-rounded font-mono">σ = 0.042</span>
        </div>
        <div class="kpi-value">{metricas.confianza_media_pct || 91.8}%</div>
        <div class="kpi-sub">
          <span>Baja dispersión</span>
          <span class="has-text-grey font-mono">Inferencia sólida</span>
        </div>
      </div>
    </div>

    <div class="column">
      <div class="kpi-card">
        <div class="is-flex is-justify-content-between is-align-items-center">
          <span class="kpi-label">Latencia Inferencia</span>
          <span class="tag is-light is-rounded font-mono">EDGE Jetson</span>
        </div>
        <div class="kpi-value">{metricas.latencia_ms || 38} <small class="is-size-6 has-text-grey font-body">ms/f</small></div>
        <div class="kpi-sub">
          <span>Tiempo real</span>
          <span class="has-text-success font-mono">{metricas.fps || 26.3} FPS</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Fila Matriz de Confusión + Comportamiento Algorítmico -->
  <div class="columns is-variable is-4">
    <!-- Matriz de Confusión Normalizada -->
    <div class="column is-7">
      <div class="card-sahara h-100">
        <div class="is-flex is-justify-content-between is-align-items-center mb-2">
          <div>
            <h3 class="headline-serif is-size-5 mb-0">Matriz de Confusión Normalizada</h3>
            <span class="has-text-grey is-size-7">N = {metricas.n_validaciones || 8420} validaciones periciales de campo</span>
          </div>
          <span class="tag is-light font-mono is-size-7">Loss: {metricas.loss || 0.018}</span>
        </div>

        <p class="is-size-7 has-text-grey mb-3">
          Distribución porcentual de coincidencias entre la red neuronal y las peritaciones en sitio. Las celdas diagonales destacan la exactitud de clasificación.
        </p>

        {#if metricas.matriz_confusion}
          <div class="matrix-table-wrapper">
            <table class="table is-fullwidth matrix-table">
              <thead>
                <tr>
                  <th class="matrix-corner">Clase Real \ Predicha</th>
                  {#each metricas.matriz_confusion.clases as clase}
                    <th class="matrix-th">{clase}</th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each metricas.matriz_confusion.clases as clase, i}
                  <tr>
                    <td class="matrix-row-header">{clase}</td>
                    {#each metricas.matriz_confusion.valores[i] as val, j}
                      {@const isDiag = i === j}
                      <td
                        class="matrix-cell"
                        class:is-diagonal={isDiag}
                        style="--cell-bg: {isDiag ? 'rgba(194, 101, 42, ' + (val / 100) + ')' : 'transparent'};"
                      >
                        <span class="matrix-val">{val}%</span>
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}

        <div class="is-flex gap-4 is-size-7 mt-3 has-text-grey">
          <span class="is-flex is-align-items-center">
            <span class="legend-box" style="background: var(--sahara-primary);"></span>
            Exactitud Directa (&gt;90%)
          </span>
          <span class="is-flex is-align-items-center">
            <span class="legend-box" style="background: var(--sahara-surface-container);"></span>
            Desvío Menor (&lt;5%)
          </span>
        </div>
      </div>
    </div>

    <!-- Comportamiento Algorítmico: Curva PR y Evolución Semanal -->
    <div class="column is-5">
      <div class="card-sahara mb-4">
        <div class="is-flex is-justify-content-between is-align-items-center mb-1">
          <h3 class="headline-serif is-size-5 mb-0">Curva Precisión - Cobertura</h3>
          <span class="tag is-sahara-primary is-light font-mono has-text-weight-bold">
            AUC: {metricas.auc || 0.961}
          </span>
        </div>
        <p class="is-size-7 has-text-grey mb-3">
          Respuesta dinámica con punto óptimo calibrado en score <strong>{metricas.umbral_optimo || 0.85}</strong>.
        </p>

        <!-- Gráfico SVG Curva PR -->
        <div class="pr-chart-svg-box">
          <svg viewBox="0 0 280 140" class="pr-svg">
            <!-- Ejes y grilla -->
            <line x1="30" y1="120" x2="270" y2="120" stroke="#d8d0c8" stroke-width="1" />
            <line x1="30" y1="10" x2="30" y2="120" stroke="#d8d0c8" stroke-width="1" />

            <!-- Curva PR -->
            <path
              d="M 30,15 Q 120,20 200,45 T 265,115"
              fill="none"
              stroke="#c2652a"
              stroke-width="2.5"
            />

            <!-- Área bajo la curva -->
            <path
              d="M 30,15 Q 120,20 200,45 T 265,115 L 265,120 L 30,120 Z"
              fill="rgba(194, 101, 42, 0.08)"
            />

            <!-- Punto óptimo -->
            <circle cx="200" cy="45" r="4.5" fill="#c2652a" />
            <text x="180" y="38" font-size="9" fill="#c2652a" font-weight="bold">Óptimo (0.85)</text>

            <!-- Etiquetas ejes -->
            <text x="130" y="135" font-size="9" fill="#78706a">Recall</text>
            <text x="5" y="65" font-size="9" fill="#78706a" transform="rotate(-90 10 65)">Precision</text>
          </svg>
        </div>
      </div>

      <!-- Evolución Semanal de Precisión -->
      <div class="card-sahara">
        <h3 class="headline-serif is-size-5 mb-0">Consistencia Temporal</h3>
        <span class="has-text-grey is-size-7">Evolución de precisión en las últimas 6 semanas</span>

        <div class="semanal-bars mt-3">
          {#if metricas.precision_semanal}
            {#each metricas.precision_semanal as sem}
              <div class="sem-item">
                <span class="sem-val font-mono is-size-7">{sem.valor}%</span>
                <div class="sem-track">
                  <div class="sem-fill" style="height: {((sem.valor - 85) / 15) * 100}%;"></div>
                </div>
                <span class="sem-lbl font-mono">{sem.semana}</span>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Active Learning: Contrastación Ground Truth vs Inferencia -->
  <div class="card-sahara">
    <div class="is-flex is-justify-content-between is-align-items-center mb-3">
      <div>
        <h3 class="headline-serif is-size-5 mb-0">Active Learning & Benchmark de Campo</h3>
        <span class="has-text-grey is-size-7">Contraste pericial para reentrenamiento continuo de pesos</span>
      </div>
      <span class="tag is-success is-light has-text-weight-bold">
        <IconCheckCircle class="mr-1" />
        Auditoría al día
      </span>
    </div>

    <div class="table-container">
      <table class="table is-fullwidth is-hoverable is-narrow table-sahara">
        <thead>
          <tr>
            <th>ID Bache</th>
            <th>Ubicación</th>
            <th>Predicción IA</th>
            <th>Medición Láser LiDAR</th>
            <th>Ground Truth Técnico</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {#each activeLearningCases as item}
            <tr>
              <td class="font-mono has-text-weight-bold has-text-primary">{item.id}</td>
              <td class="is-size-7">{item.direccion}</td>
              <td>
                <span class="tag is-light is-rounded is-size-7 font-mono">{item.prediccionIA}</span>
              </td>
              <td class="is-size-7 font-mono">{item.medicionLidar}</td>
              <td class="is-size-7 has-text-weight-bold">{item.groundTruth}</td>
              <td>
                <span class="tag is-success is-light is-size-7 is-rounded has-text-weight-semibold">
                  {item.estado}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style lang="scss">
  .ia-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .kpi-card {
    background: var(--sahara-surface-lowest);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: var(--sahara-radius);
    padding: 1.25rem;
    box-shadow: var(--sahara-shadow-soft);
    display: flex;
    flex-direction: column;
  }

  .kpi-label {
    font-size: 0.75rem;
    color: var(--sahara-text-muted);
    font-weight: 600;
  }

  .kpi-value {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--sahara-text);
    line-height: 1.1;
    margin: 0.35rem 0;
  }

  .kpi-sub {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--sahara-text-muted);
    border-top: 1px solid var(--sahara-outline-variant);
    padding-top: 0.4rem;
  }

  .matrix-table-wrapper {
    overflow-x: auto;
    margin-top: 0.5rem;
  }

  .matrix-table {
    border-collapse: separate;
    border-spacing: 4px;
    background: transparent;

    th, td {
      text-align: center;
      padding: 0.65rem;
      vertical-align: middle;
      border: none;
    }
  }

  .matrix-corner {
    font-size: 0.7rem;
    color: var(--sahara-text-muted);
    text-align: left !important;
  }

  .matrix-th {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--sahara-text);
  }

  .matrix-row-header {
    font-size: 0.75rem;
    font-weight: 700;
    text-align: left !important;
    color: var(--sahara-text);
  }

  .matrix-cell {
    background-color: var(--cell-bg);
    border-radius: 6px;
    border: 1px solid var(--sahara-outline-variant);

    &.is-diagonal {
      border-color: var(--sahara-primary);
      .matrix-val {
        color: #ffffff;
        font-weight: 800;
      }
    }
  }

  .matrix-val {
    font-size: 0.8rem;
    font-family: monospace;
    font-weight: 600;
    color: var(--sahara-text);
  }

  .legend-box {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    display: inline-block;
    margin-right: 0.4rem;
  }

  .pr-chart-svg-box {
    width: 100%;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pr-svg {
    width: 100%;
    height: 100%;
  }

  .semanal-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 110px;
    padding-top: 1rem;
    gap: 0.5rem;
  }

  .sem-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    height: 100%;
    justify-content: flex-end;
  }

  .sem-track {
    width: 16px;
    height: 70px;
    background-color: var(--sahara-surface-container);
    border-radius: 4px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }

  .sem-fill {
    width: 100%;
    background-color: var(--sahara-primary);
    border-radius: 4px 4px 0 0;
    transition: height 0.3s ease;
  }

  .sem-val {
    font-size: 0.65rem;
    margin-bottom: 0.25rem;
  }

  .sem-lbl {
    font-size: 0.7rem;
    color: var(--sahara-text-muted);
    margin-top: 0.35rem;
  }

  .table-sahara {
    background: transparent;

    th {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: var(--sahara-text-muted);
      border-bottom: 1px solid var(--sahara-outline-variant);
    }

    td {
      border-bottom: 1px solid var(--sahara-outline-variant);
      vertical-align: middle;
    }
  }
</style>
