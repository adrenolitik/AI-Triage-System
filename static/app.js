// Anesthesiology Triage Application - Fully Client-Side (no external dependencies)

// ===========================
// SCORING LOGIC (from scoring.ts)
// ===========================

/**
 * Calculate National Early Warning Score (NEWS)
 * Range: 0-20
 */
function calculateNEWS(vitals) {
  let score = 0;

  // Respiratory rate
  if (vitals.respiratoryRate <= 8) score += 3;
  else if (vitals.respiratoryRate <= 11) score += 1;
  else if (vitals.respiratoryRate <= 20) score += 0;
  else if (vitals.respiratoryRate <= 24) score += 2;
  else score += 3;

  // SpO2
  if (vitals.spo2 <= 91) score += 3;
  else if (vitals.spo2 <= 93) score += 2;
  else if (vitals.spo2 <= 95) score += 1;
  else score += 0;

  // Oxygen supplementation
  if (vitals.oxygenSupplementation) score += 2;

  // Heart rate
  if (vitals.heartRate <= 40) score += 3;
  else if (vitals.heartRate <= 50) score += 1;
  else if (vitals.heartRate <= 90) score += 0;
  else if (vitals.heartRate <= 110) score += 1;
  else if (vitals.heartRate <= 130) score += 2;
  else score += 3;

  // Systolic BP
  if (vitals.systolicBP <= 90) score += 3;
  else if (vitals.systolicBP <= 100) score += 2;
  else if (vitals.systolicBP <= 110) score += 1;
  else if (vitals.systolicBP <= 219) score += 0;
  else score += 3;

  // Temperature
  if (vitals.temperature <= 35.0) score += 3;
  else if (vitals.temperature <= 36.0) score += 1;
  else if (vitals.temperature <= 38.0) score += 0;
  else if (vitals.temperature <= 39.0) score += 1;
  else score += 2;

  // Consciousness (AVPU)
  if (vitals.consciousnessLevel === 'alert') score += 0;
  else score += 3;

  return score;
}

/**
 * Calculate Modified Early Warning Score (MEWS)
 * Range: 0-14
 */
function calculateMEWS(vitals) {
  let score = 0;

  if (vitals.respiratoryRate < 9) score += 2;
  else if (vitals.respiratoryRate <= 14) score += 0;
  else if (vitals.respiratoryRate <= 20) score += 1;
  else if (vitals.respiratoryRate <= 29) score += 2;
  else score += 3;

  if (vitals.heartRate < 40) score += 2;
  else if (vitals.heartRate <= 50) score += 1;
  else if (vitals.heartRate <= 100) score += 0;
  else if (vitals.heartRate <= 110) score += 1;
  else if (vitals.heartRate <= 129) score += 2;
  else score += 3;

  if (vitals.systolicBP < 70) score += 3;
  else if (vitals.systolicBP <= 80) score += 2;
  else if (vitals.systolicBP <= 100) score += 1;
  else if (vitals.systolicBP <= 199) score += 0;
  else score += 2;

  if (vitals.temperature < 35) score += 2;
  else if (vitals.temperature <= 38.4) score += 0;
  else score += 2;

  if (vitals.consciousnessLevel === 'alert') score += 0;
  else if (vitals.consciousnessLevel === 'voice') score += 1;
  else if (vitals.consciousnessLevel === 'pain') score += 2;
  else score += 3;

  return score;
}

/**
 * Calculate Quick SOFA (qSOFA)
 * Range: 0-3
 */
function calculateQSOFA(vitals) {
  let score = 0;
  if (vitals.respiratoryRate >= 22) score += 1;
  if (vitals.consciousnessLevel !== 'alert') score += 1;
  if (vitals.systolicBP <= 100) score += 1;
  return score;
}

/**
 * Determine triage level based on combined scores and clinical features
 */
function determineTriageLevel(scores, vitals, features) {
  const result = {
    level: 'non-urgent',
    color: 'blue',
    priorityScore: 0,
    immediateActions: [],
    monitoringPlan: [],
    investigationsNeeded: [],
    escalationRequired: false,
  };

  result.priorityScore = Math.min(100, scores.news * 4 + scores.mews * 3 + scores.qsofa * 10);

  // Critical/Resuscitation (RED)
  if (
    scores.qsofa >= 2 ||
    scores.news >= 7 ||
    vitals.consciousnessLevel === 'unresponsive' ||
    vitals.spo2 < 85 ||
    vitals.systolicBP < 70 ||
    features.seizures
  ) {
    result.level = 'resuscitation';
    result.color = 'red';
    result.priorityScore = Math.max(result.priorityScore, 90);
    result.escalationRequired = true;
    result.immediateActions.push(
      'Немедленная помощь реаниматолога',
      'Обеспечить проходимость дыхательных путей',
      'Подача высокопоточного кислорода',
      'Венозный доступ и инфузионная терапия',
      'Мониторинг витальных функций'
    );
    result.investigationsNeeded.push(
      'ЭКГ',
      'КТ головы (при травме/неврологии)',
      'Общий анализ крови, биохимия',
      'Коагулограмма',
      'Газы крови'
    );
  }
  // Emergency (ORANGE)
  else if (
    scores.news >= 5 ||
    scores.mews >= 5 ||
    features.chestPain ||
    features.bleeding ||
    vitals.spo2 < 90 ||
    vitals.systolicBP < 90
  ) {
    result.level = 'emergency';
    result.color = 'orange';
    result.priorityScore = Math.max(result.priorityScore, 70);
    result.escalationRequired = true;
    result.immediateActions.push(
      'Немедленный осмотр врача (в течение 10 минут)',
      'Подача кислорода при SpO2 < 94%',
      'Венозный доступ',
      'Мониторинг витальных функций каждые 15 минут'
    );
    result.investigationsNeeded.push(
      'ЭКГ (при боли в груди)',
      'Общий анализ крови',
      'Биохимия крови',
      'Рентген грудной клетки (при одышке)'
    );
  }
  // Urgent (YELLOW)
  else if (
    scores.news >= 3 ||
    scores.mews >= 3 ||
    features.dyspnea ||
    features.trauma ||
    vitals.temperature > 38.5 ||
    vitals.temperature < 36.0
  ) {
    result.level = 'urgent';
    result.color = 'yellow';
    result.priorityScore = Math.max(result.priorityScore, 50);
    result.immediateActions.push(
      'Осмотр врача в течение 30 минут',
      'Контроль витальных функций каждые 30 минут',
      'Обеспечить комфорт пациента'
    );
    result.investigationsNeeded.push(
      'Общий анализ крови',
      'Общий анализ мочи',
      'Рентгенография при необходимости'
    );
  }
  // Semi-urgent (GREEN)
  else if (scores.news > 0 || scores.mews > 0) {
    result.level = 'semi-urgent';
    result.color = 'green';
    result.priorityScore = Math.max(result.priorityScore, 30);
    result.immediateActions.push(
      'Осмотр врача в течение 60 минут',
      'Измерение витальных функций каждый час'
    );
    result.investigationsNeeded.push('Базовые анализы по показаниям');
  }
  // Non-urgent (BLUE)
  else {
    result.level = 'non-urgent';
    result.color = 'blue';
    result.priorityScore = Math.max(result.priorityScore, 10);
    result.immediateActions.push(
      'Плановый осмотр в течение 120 минут',
      'Регистрация данных'
    );
  }

  // Monitoring plan
  switch (result.level) {
    case 'resuscitation':
      result.monitoringPlan.push(
        'Непрерывный мониторинг ЭКГ, SpO2, АД',
        'Контроль сознания каждые 5 минут',
        'Учёт диуреза'
      );
      break;
    case 'emergency':
      result.monitoringPlan.push(
        'Мониторинг витальных функций каждые 15 минут',
        'Оценка динамики состояния каждые 30 минут'
      );
      break;
    case 'urgent':
      result.monitoringPlan.push(
        'Контроль витальных функций каждые 30 минут',
        'Переоценка через 1 час'
      );
      break;
    case 'semi-urgent':
      result.monitoringPlan.push(
        'Контроль витальных функций каждый час',
        'Переоценка через 2 часа'
      );
      break;
    default:
      result.monitoringPlan.push('Базовый мониторинг', 'Переоценка при изменении состояния');
  }

  return result;
}

// ===========================
// LOCAL STORAGE PERSISTENCE
// ===========================

function loadPatientsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('triage_patients') || '[]');
  } catch { return []; }
}

function savePatientsToStorage(patients) {
  localStorage.setItem('triage_patients', JSON.stringify(patients));
}

function addPatientToStorage(patientData) {
  const patients = loadPatientsFromStorage();
  // Check if patient exists, update or add
  const existingIdx = patients.findIndex(p => p.patient_id === patientData.patient_id);
  if (existingIdx >= 0) {
    patients[existingIdx] = patientData;
  } else {
    patients.push(patientData);
  }
  savePatientsToStorage(patients);
  return patients;
}

function computeStats(patients) {
  if (patients.length === 0) {
    return {
      total_patients: 0,
      red_patients: 0, orange_patients: 0, yellow_patients: 0,
      green_patients: 0, blue_patients: 0,
      avg_news: 0, avg_mews: 0, avg_priority: 0,
    };
  }
  const stats = {
    total_patients: patients.length,
    red_patients: patients.filter(p => p.triage_color === 'red').length,
    orange_patients: patients.filter(p => p.triage_color === 'orange').length,
    yellow_patients: patients.filter(p => p.triage_color === 'yellow').length,
    green_patients: patients.filter(p => p.triage_color === 'green').length,
    blue_patients: patients.filter(p => p.triage_color === 'blue').length,
    avg_news: patients.reduce((s, p) => s + (p.news_score || 0), 0) / patients.length,
    avg_mews: patients.reduce((s, p) => s + (p.mews_score || 0), 0) / patients.length,
    avg_priority: patients.reduce((s, p) => s + (p.priority_score || 0), 0) / patients.length,
  };
  return stats;
}

// ===========================
// APPLICATION STATE
// ===========================

const state = {
  currentView: 'form',
  patients: [],
  stats: null,
};

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  state.patients = loadPatientsFromStorage();
  state.stats = computeStats(state.patients);
  renderApp();
});

// ===========================
// RENDERING
// ===========================

function renderApp() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="min-h-screen">
      <!-- Header -->
      <header class="bg-blue-600 text-white shadow-lg">
        <div class="container mx-auto px-4 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold">
                &#10084;&#65039; Анестезиологический Триаж
              </h1>
              <p class="text-blue-100 mt-1">Система оценки тяжести состояния пациентов</p>
            </div>
            <div id="stats-summary" class="text-right">
            </div>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-white shadow-md mb-6">
        <div class="container mx-auto px-4">
          <div class="flex space-x-1">
            <button onclick="switchView('form')" 
                    class="nav-btn px-6 py-3 font-medium ${state.currentView === 'form' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}">
              &#10133; Новая оценка
            </button>
            <button onclick="switchView('patients')" 
                    class="nav-btn px-6 py-3 font-medium ${state.currentView === 'patients' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}">
              &#128101; Список пациентов
            </button>
            <button onclick="switchView('stats')" 
                    class="nav-btn px-6 py-3 font-medium ${state.currentView === 'stats' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}">
              &#128202; Статистика
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="container mx-auto px-4 pb-12">
        <div id="main-content"></div>
      </main>
    </div>
  `;

  renderMainContent();
  renderStatsSummary();
}

function switchView(view) {
  state.currentView = view;
  if (view === 'patients' || view === 'stats') {
    state.patients = loadPatientsFromStorage();
    state.stats = computeStats(state.patients);
  }
  renderApp();
}

function renderMainContent() {
  const content = document.getElementById('main-content');
  switch (state.currentView) {
    case 'form':
      content.innerHTML = renderTriageForm();
      break;
    case 'patients':
      content.innerHTML = renderPatientsList();
      break;
    case 'stats':
      content.innerHTML = renderStatsView();
      break;
  }
}

// ===========================
// TRIAGE FORM
// ===========================

function renderTriageForm() {
  return `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          &#128203; Оценка пациента
        </h2>
        
        <form id="triage-form" onsubmit="handleSubmit(event)">
          <!-- Patient Information -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3 text-blue-900">
              &#128100; Информация о пациенте
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">ID Пациента *</label>
                <input type="text" name="patientId" required 
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Возраст</label>
                <input type="number" name="age" min="0" max="120"
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Пол</label>
                <select name="gender" class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="">Не указан</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Способ доставки</label>
                <select name="arrivalMode" class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="walking">Пешком</option>
                  <option value="ambulance">Скорая помощь</option>
                  <option value="icu">Реанимация</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1">Жалоба</label>
                <input type="text" name="chiefComplaint" 
                       placeholder="Боль в груди, одышка, травма..."
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
          </div>

          <!-- Vital Signs -->
          <div class="mb-6 p-4 bg-red-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3 text-red-900">
              &#128147; Витальные показатели
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">ЧДД (дых/мин) *</label>
                <input type="number" name="respiratoryRate" required min="0" max="60"
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">SpO&#8322; (%) *</label>
                <input type="number" name="spo2" required min="50" max="100"
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Подача O&#8322;</label>
                <div class="flex items-center space-x-4 mt-2">
                  <label class="flex items-center">
                    <input type="checkbox" name="oxygenSupplementation" class="mr-2">
                    <span class="text-sm">Да</span>
                  </label>
                  <input type="number" name="oxygenFlow" placeholder="L/мин" min="0" max="15"
                         class="w-20 px-2 py-1 border rounded-md text-sm">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">ЧСС (уд/мин) *</label>
                <input type="number" name="heartRate" required min="20" max="250"
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">АД сист. (мм рт.ст.) *</label>
                <input type="number" name="systolicBP" required min="40" max="280"
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">АД диаст. (мм рт.ст.)</label>
                <input type="number" name="diastolicBP" min="20" max="180"
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Температура (°C) *</label>
                <input type="number" name="temperature" required min="30" max="44" step="0.1"
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Уровень сознания *</label>
                <select name="consciousnessLevel" required 
                        class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
                  <option value="alert">Ясное (A)</option>
                  <option value="voice">Реакция на голос (V)</option>
                  <option value="pain">Реакция на боль (P)</option>
                  <option value="unresponsive">Без сознания (U)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">GCS (3-15)</label>
                <input type="number" name="gcsScore" min="3" max="15"
                       class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
              </div>
            </div>
          </div>

          <!-- Clinical Features -->
          <div class="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3 text-yellow-900">
              &#9888;&#65039; Клинические признаки
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="chestPain" class="w-4 h-4">
                <span>Боль в груди</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="dyspnea" class="w-4 h-4">
                <span>Одышка</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="trauma" class="w-4 h-4">
                <span>Травма</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="bleeding" class="w-4 h-4">
                <span>Кровотечение</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="seizures" class="w-4 h-4">
                <span>Судороги</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="alteredMentalStatus" class="w-4 h-4">
                <span>Нарушение сознания</span>
              </label>
            </div>
          </div>

          <!-- Assessed By -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-1">Врач</label>
            <input type="text" name="assessedBy" 
                   class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-3">
            <button type="button" onclick="document.getElementById('triage-form').reset()"
                    class="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium">
              &#8635; Очистить
            </button>
            <button type="submit" 
                    class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
              &#128190; Оценить и сохранить
            </button>
          </div>
        </form>
      </div>

      <!-- Result Modal -->
      <div id="result-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div id="result-content"></div>
        </div>
      </div>
    </div>
  `;
}

// ===========================
// FORM SUBMISSION (client-side scoring + localStorage)
// ===========================

function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const vitals = {
    respiratoryRate: parseInt(formData.get('respiratoryRate')),
    spo2: parseInt(formData.get('spo2')),
    oxygenSupplementation: formData.get('oxygenSupplementation') === 'on',
    heartRate: parseInt(formData.get('heartRate')),
    systolicBP: parseInt(formData.get('systolicBP')),
    temperature: parseFloat(formData.get('temperature')),
    consciousnessLevel: formData.get('consciousnessLevel') || 'alert',
    gcsScore: parseInt(formData.get('gcsScore')) || null,
  };

  const features = {
    chestPain: formData.get('chestPain') === 'on',
    dyspnea: formData.get('dyspnea') === 'on',
    trauma: formData.get('trauma') === 'on',
    bleeding: formData.get('bleeding') === 'on',
    seizures: formData.get('seizures') === 'on',
    alteredMentalStatus: formData.get('alteredMentalStatus') === 'on',
  };

  // Calculate scores
  const newsScore = calculateNEWS(vitals);
  const mewsScore = calculateMEWS(vitals);
  const qsofaScore = calculateQSOFA(vitals);

  const triageResult = determineTriageLevel(
    { news: newsScore, mews: mewsScore, qsofa: qsofaScore },
    vitals,
    features
  );

  // Build patient record
  const patientRecord = {
    patient_id: formData.get('patientId'),
    age: parseInt(formData.get('age')) || null,
    gender: formData.get('gender') || null,
    arrival_mode: formData.get('arrivalMode') || 'walking',
    chief_complaint: formData.get('chiefComplaint') || null,
    admission_time: new Date().toISOString(),
    triage_level: triageResult.level,
    triage_color: triageResult.color,
    priority_score: triageResult.priorityScore,
    news_score: newsScore,
    mews_score: mewsScore,
    qsofa_score: qsofaScore,
    assessed_by: formData.get('assessedBy') || null,
  };

  // Save to localStorage
  state.patients = addPatientToStorage(patientRecord);
  state.stats = computeStats(state.patients);

  // Show result
  showResult({
    scores: { news: newsScore, mews: mewsScore, qsofa: qsofaScore },
    triage: triageResult,
  });

  form.reset();
}

// ===========================
// RESULT MODAL
// ===========================

function showResult(data) {
  const modal = document.getElementById('result-modal');
  const content = document.getElementById('result-content');

  const colorClass = `triage-${data.triage.color}`;
  const levelText = {
    'resuscitation': 'РЕАНИМАЦИЯ',
    'emergency': 'ЭКСТРЕННАЯ',
    'urgent': 'СРОЧНАЯ',
    'semi-urgent': 'ПОЛУСРОЧНАЯ',
    'non-urgent': 'НЕСРОЧНАЯ',
  };

  content.innerHTML = `
    <div class="p-6">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-2xl font-bold text-gray-800">Результат оценки</h2>
        <button onclick="closeResultModal()" class="text-gray-500 hover:text-gray-700 text-xl">
          &#10005;
        </button>
      </div>

      <div class="${colorClass} rounded-lg p-6 mb-4 text-center">
        <div class="text-4xl font-bold mb-2">${levelText[data.triage.level]}</div>
        <div class="text-xl">Приоритет: ${data.triage.priorityScore}/100</div>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-blue-600">${data.scores.news}</div>
          <div class="text-sm text-gray-600">NEWS</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-purple-600">${data.scores.mews}</div>
          <div class="text-sm text-gray-600">MEWS</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-orange-600">${data.scores.qsofa}</div>
          <div class="text-sm text-gray-600">qSOFA</div>
        </div>
      </div>

      ${data.triage.immediateActions.length > 0 ? `
        <div class="mb-4">
          <h3 class="font-semibold text-red-700 mb-2">
            &#9889; Немедленные действия:
          </h3>
          <ul class="list-disc list-inside space-y-1 text-sm">
            ${data.triage.immediateActions.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${data.triage.monitoringPlan.length > 0 ? `
        <div class="mb-4">
          <h3 class="font-semibold text-blue-700 mb-2">
            &#128147; План мониторинга:
          </h3>
          <ul class="list-disc list-inside space-y-1 text-sm">
            ${data.triage.monitoringPlan.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${data.triage.investigationsNeeded.length > 0 ? `
        <div class="mb-4">
          <h3 class="font-semibold text-green-700 mb-2">
            &#128300; Необходимые исследования:
          </h3>
          <ul class="list-disc list-inside space-y-1 text-sm">
            ${data.triage.investigationsNeeded.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${data.triage.escalationRequired ? `
        <div class="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
          <div class="flex items-center">
            <span class="text-red-600 mr-2">&#9888;&#65039;</span>
            <span class="font-semibold text-red-800">Требуется эскалация помощи!</span>
          </div>
        </div>
      ` : ''}

      <div class="flex justify-end space-x-3">
        <button onclick="closeResultModal()" 
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
          &#10003; Понятно
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeResultModal() {
  document.getElementById('result-modal').classList.add('hidden');
  renderStatsSummary();
}

// ===========================
// PATIENTS LIST
// ===========================

function renderPatientsList() {
  if (state.patients.length === 0) {
    return `
      <div class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl text-gray-300 mb-4">&#128101;</div>
        <p class="text-gray-500 text-lg">Пока нет пациентов</p>
      </div>
    `;
  }

  // Sort by priority descending
  const sorted = [...state.patients].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  return `
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-gray-50 border-b">
        <h2 class="text-xl font-bold text-gray-800">
          &#128101; Список пациентов (${state.patients.length})
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold">ID</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Возраст/Пол</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Жалоба</th>
              <th class="px-4 py-3 text-center text-sm font-semibold">Триаж</th>
              <th class="px-4 py-3 text-center text-sm font-semibold">Приоритет</th>
              <th class="px-4 py-3 text-center text-sm font-semibold">Шкалы</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Время</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${sorted.map(patient => `
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">${patient.patient_id}</td>
                <td class="px-4 py-3">${patient.age || '-'}/${patient.gender === 'male' ? 'М' : patient.gender === 'female' ? 'Ж' : '-'}</td>
                <td class="px-4 py-3 text-sm">${patient.chief_complaint || '-'}</td>
                <td class="px-4 py-3 text-center">
                  <span class="triage-${patient.triage_color} px-3 py-1 rounded-full text-xs font-bold">
                    ${(patient.triage_level || '').toUpperCase()}
                  </span>
                </td>
                <td class="px-4 py-3 text-center font-bold text-lg">${patient.priority_score || '-'}</td>
                <td class="px-4 py-3 text-center text-sm">
                  <div>NEWS: ${patient.news_score}</div>
                  <div>MEWS: ${patient.mews_score}</div>
                  <div>qSOFA: ${patient.qsofa_score}</div>
                </td>
                <td class="px-4 py-3 text-sm">${new Date(patient.admission_time).toLocaleString('ru-RU')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ===========================
// STATISTICS
// ===========================

function renderStatsView() {
  if (!state.stats) {
    return `
      <div class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-4xl text-gray-300 mb-4">&#9203;</div>
        <p class="text-gray-500">Загрузка статистики...</p>
      </div>
    `;
  }

  const s = state.stats;

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          &#128202; Статистика
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-blue-50 p-6 rounded-lg text-center">
            <div class="text-4xl font-bold text-blue-600">${s.total_patients || 0}</div>
            <div class="text-gray-600 mt-2">Всего пациентов</div>
          </div>
          <div class="bg-purple-50 p-6 rounded-lg text-center">
            <div class="text-4xl font-bold text-purple-600">${(s.avg_news || 0).toFixed(1)}</div>
            <div class="text-gray-600 mt-2">Средний NEWS</div>
          </div>
          <div class="bg-orange-50 p-6 rounded-lg text-center">
            <div class="text-4xl font-bold text-orange-600">${(s.avg_priority || 0).toFixed(0)}</div>
            <div class="text-gray-600 mt-2">Средний приоритет</div>
          </div>
        </div>

        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold mb-4">Распределение по категориям триажа:</h3>
          <div class="space-y-3">
            ${renderTriageBar('КРАСНАЯ', 'red', s.red_patients, s.total_patients)}
            ${renderTriageBar('ОРАНЖЕВАЯ', 'orange', s.orange_patients, s.total_patients)}
            ${renderTriageBar('ЖЁЛТАЯ', 'yellow', s.yellow_patients, s.total_patients)}
            ${renderTriageBar('ЗЕЛЁНАЯ', 'green', s.green_patients, s.total_patients)}
            ${renderTriageBar('СИНЯЯ', 'blue', s.blue_patients, s.total_patients)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTriageBar(label, color, count, total) {
  const pct = total > 0 ? ((count || 0) / total * 100) : 0;
  return `
    <div class="flex items-center">
      <div class="w-32 font-medium">
        <span class="triage-${color} px-3 py-1 rounded text-sm">${label}</span>
      </div>
      <div class="flex-1 bg-gray-200 rounded-full h-6 ml-4">
        <div class="triage-${color} h-6 rounded-full flex items-center justify-end px-2 text-sm font-bold"
             style="width: ${Math.max(pct, count > 0 ? 8 : 0)}%">
          ${count || 0}
        </div>
      </div>
    </div>
  `;
}

// ===========================
// STATS SUMMARY (header)
// ===========================

function renderStatsSummary() {
  const summary = document.getElementById('stats-summary');
  if (!summary) return;

  if (!state.stats) {
    summary.innerHTML = '<div class="text-sm">Загрузка...</div>';
    return;
  }

  const critical = (state.stats.red_patients || 0) + (state.stats.orange_patients || 0);

  summary.innerHTML = `
    <div class="text-sm">
      <div class="font-bold text-2xl">${state.stats.total_patients || 0}</div>
      <div class="text-blue-100">Пациентов</div>
      ${critical > 0 ? `<div class="text-yellow-300 font-semibold mt-1">&#9888; ${critical} критических</div>` : ''}
    </div>
  `;
}

// ===========================
// GLOBAL FUNCTIONS
// ===========================

window.switchView = switchView;
window.handleSubmit = handleSubmit;
window.closeResultModal = closeResultModal;
