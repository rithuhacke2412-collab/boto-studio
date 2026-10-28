const STORAGE_KEY = 'boto-studio-state';
const APPROVAL_KEY = 'boto-studio-approvals';

const app = document.getElementById('app');
const preview = document.getElementById('script-preview');
const nameInput = document.getElementById('script-name');
const saveButton = document.getElementById('save-boto');
const themeButtons = document.querySelectorAll('.theme-button');
const navButtons = document.querySelectorAll('.nav-button');
const segments = document.querySelectorAll('.segment');
const langButtons = document.querySelectorAll('.lang-button');
const approvalModal = document.getElementById('approval-modal');
const warningList = document.getElementById('warning-list');
const cancelApprovalButton = document.getElementById('cancel-approval');
const approveScriptButton = document.getElementById('approve-script');
const logoImage = document.querySelector('.logo-image');
const logoPlaceholder = document.querySelector('.logo-placeholder');

const state = {
  theme: 'dark',
  currentTab: 'upload',
  language: 'PowerShell',
  mode: 'paste',
  scriptName: 'Nightly backup',
  scriptSource: `# Copy Documents to the backup drive\n$src = "$env:USERPROFILE\\Documents"\n$dst = "D:\\Backup\\Documents"\nrobocopy $src $dst /MIR /R:1 /W:1\nWrite-Output "Backup finished"`,
  approvedScripts: {},
};

function bindLogoFallback() {
  if (!logoImage || !logoPlaceholder) return;
  logoImage.addEventListener('error', () => {
    logoImage.style.display = 'none';
    logoPlaceholder.hidden = false;
    logoPlaceholder.style.display = 'block';
  });
}

function loadState() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  Object.assign(state, saved);
  if (state.theme) {
    applyTheme(state.theme);
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyTheme(theme) {
  state.theme = theme;
  app.classList.toggle('light', theme === 'light');
  app.classList.toggle('dark', theme !== 'light');
  themeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.theme === theme);
  });
  persistState();
}

function setTab(view) {
  state.currentTab = view;
  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === `screen-${view}`);
  });
}

function setMode(mode) {
  state.mode = mode;
  segments.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
}

function setLanguage(language) {
  state.language = language;
  langButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.language === language);
  });
}

function scanCode(text) {
  const warningTypes = [
    { name: 'Info', matches: ['Read-Host', 'pause', 'set /p', 'choice', 'input('] },
    { name: 'Caution', matches: ['Remove-Item', 'del /s', 'rd /s', 'rmdir /s', 'format', 'shutil.rmtree', 'os.remove'] },
    { name: 'High caution', matches: ['RunAs', 'HKLM', 'net user', 'sc config', 'bcdedit', 'password=', 'passwd', 'apikey', 'api_key', 'token=', 'secret', '-----BEGIN PRIVATE KEY-----', 'Invoke-Expression', 'iex', 'curl', 'wget', 'Restart-Computer', 'Stop-Computer', 'shutdown', 'schtasks /create', 'Register-ScheduledTask', 'Run', 'Set-MpPreference'] },
  ];

  const warnings = [];
  const lines = text.split('\n');
  warningTypes.forEach((type) => {
    const hits = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => type.matches.some((pattern) => line.toLowerCase().includes(pattern.toLowerCase())));

    if (hits.length > 0) {
      warnings.push({
        group: type.name,
        entries: hits.map(({ line, index }) => ({ number: index + 1, text: line.trim() })),
      });
    }
  });

  return warnings;
}

function renderWarnings(warnings) {
  if (warnings.length === 0) {
    warningList.innerHTML = '<div class="warning-item"><div class="warning-header">Info</div><div class="warning-body">No obvious warning patterns were detected in this script.</div></div>';
    return;
  }

  warningList.innerHTML = warnings.map((warning) => `
    <div class="warning-item">
      <div class="warning-header">${warning.group}</div>
      <div class="warning-body">${warning.entries.map((entry) => `L${entry.number}: ${entry.text}`).join('\n')}</div>
    </div>
  `).join('');
}

function serializeState() {
  state.scriptName = nameInput.value.trim() || 'Untitled script';
  state.scriptSource = preview.textContent || '';
  persistState();
}

function openApprovalDialog() {
  const text = preview.textContent || '';
  const warnings = scanCode(text);
  renderWarnings(warnings);
  approvalModal.classList.remove('hidden');
}

function closeApprovalDialog() {
  approvalModal.classList.add('hidden');
}

function approveScript() {
  const scriptKey = `${nameInput.value.trim()}|${state.language}`;
  state.approvedScripts[scriptKey] = { approvedAt: new Date().toISOString(), hash: sha256(preview.textContent || '') };
  localStorage.setItem(APPROVAL_KEY, JSON.stringify(state.approvedScripts));
  closeApprovalDialog();
}

function sha256(value) {
  return Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0).toString(16).padStart(2, '0'), '');
}

function bindEvents() {
  themeButtons.forEach((button) => {
    button.addEventListener('click', () => applyTheme(button.dataset.theme));
  });

  navButtons.forEach((button) => {
    button.addEventListener('click', () => setTab(button.dataset.view));
  });

  segments.forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });

  langButtons.forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });

  nameInput.addEventListener('input', serializeState);
  preview.addEventListener('input', serializeState);
  saveButton.addEventListener('click', () => {
    serializeState();
    openApprovalDialog();
  });
  cancelApprovalButton.addEventListener('click', closeApprovalDialog);
  approveScriptButton.addEventListener('click', approveScript);
}

function hydrateInitialValues() {
  const loadedApprovals = JSON.parse(localStorage.getItem(APPROVAL_KEY) || '{}');
  state.approvedScripts = loadedApprovals;

  nameInput.value = state.scriptName || 'Nightly backup';
  preview.textContent = state.scriptSource || `# Copy Documents to the backup drive\n$src = "$env:USERPROFILE\\Documents"\n$dst = "D:\\Backup\\Documents"\nrobocopy $src $dst /MIR /R:1 /W:1\nWrite-Output "Backup finished"`;
  setLanguage(state.language || 'PowerShell');
  setMode(state.mode || 'paste');
  setTab(state.currentTab || 'upload');
}

bindLogoFallback();
loadState();
bindEvents();
hydrateInitialValues();
applyTheme(state.theme || 'dark');
