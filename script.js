// -----------------------------
// DATA INIT & LOCAL STORAGE
// -----------------------------
let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const subjectForm = document.getElementById('subjectForm');
const taskForm = document.getElementById('taskForm');
const taskSubject = document.getElementById('taskSubject');
const subjectDashboard = document.getElementById('subjectDashboard');
const urgentTasksDiv = document.getElementById('urgentTasks');
const emptyState = document.getElementById('emptyState');
const allCaughtUp = document.getElementById('allCaughtUp');

const totalSubjects = document.getElementById('totalSubjects');
const totalTasks = document.getElementById('totalTasks');
const tasksToday = document.getElementById('tasksToday');

const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Save to localStorage
function saveData() {
  localStorage.setItem('subjects', JSON.stringify(subjects));
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// -----------------------------
// ADD SUBJECT
// -----------------------------
subjectForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('subjectName').value.trim();
  if (!name || subjects.includes(name)) return;
  subjects.push(name);
  saveData();
  renderSubjects();
  document.getElementById('subjectName').value = '';
  renderDashboard();
  updateSummary();
});

// -----------------------------
// ADD TASK
// -----------------------------
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const task = {
    name: document.getElementById('taskName').value,
    subject: taskSubject.value,
    type: document.getElementById('taskType').value,
    due: document.getElementById('taskDueDate').value,
    priority: document.getElementById('taskPriority').value,
    completed: false
  };
  tasks.push(task);
  saveData();
  renderDashboard();
  taskForm.reset();
  updateSummary();
});

// -----------------------------
// CLEAR COMPLETED TASKS
// -----------------------------
clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  saveData();
  renderDashboard();
  updateSummary();
});

// -----------------------------
// RENDER SUBJECTS IN DROPDOWN
// -----------------------------
function renderSubjects() {
  taskSubject.innerHTML = '<option value="" disabled selected>Select Subject</option>';
  subjects.forEach(sub => {
    const option = document.createElement('option');
    option.value = sub;
    option.textContent = sub;
    taskSubject.appendChild(option);
  });
}

// -----------------------------
// URGENCY CALCULATION
// -----------------------------
function getUrgency(task) {
  const today = new Date();
  const due = new Date(task.due);
  const diffDays = Math.ceil((due - today) / (1000*60*60*24));
  let score = 0;
  if(task.priority === "High") score += 5;
  if(task.priority === "Medium") score += 3;
  if(task.priority === "Low") score += 1;
  score += Math.max(0, 10 - diffDays);
  return score;
}

// -----------------------------
// RENDER DASHBOARD
// -----------------------------
function renderDashboard() {
  subjectDashboard.innerHTML = '';
  urgentTasksDiv.innerHTML = '';

  // EMPTY STATES
  if(subjects.length === 0 || tasks.length === 0) {
    emptyState.style.display = 'block';
    allCaughtUp.style.display = 'none';
    return;
  }

  const allCompleted = tasks.every(t => t.completed);
  emptyState.style.display = allCompleted ? 'none' : 'none';
  allCaughtUp.style.display = allCompleted ? 'block' : 'none';

  // SUBJECT CARDS
  subjects.forEach(sub => {
    const subTasks = tasks.filter(t => t.subject === sub)
                          .sort((a,b) => getUrgency(b) - getUrgency(a));

    const subCard = document.createElement('div');
    subCard.classList.add('subject-card');
    subCard.innerHTML = `<h3>${sub} (${subTasks.length} Tasks)</h3>`;

    // Progress bar
    const completed = subTasks.filter(t => t.completed).length;
    const progress = document.createElement('div');
    progress.classList.add('progress-container');
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    progressBar.style.width = subTasks.length ? `${(completed/subTasks.length)*100}%` : '0%';
    progress.appendChild(progressBar);
    subCard.appendChild(progress);

    // Task Cards
    subTasks.forEach(t => {
      const taskDiv = document.createElement('div');
      taskDiv.classList.add('task-card', t.priority.toLowerCase());
      if(t.completed) taskDiv.classList.add('completed');
      taskDiv.innerHTML = `
        <div class="task-name-wrapper">
          <input type="checkbox" ${t.completed ? 'checked' : ''}>
          <strong>${t.name}</strong> (${t.type}) - Due: ${t.due}
        </div>
        <span>${t.priority}</span>
      `;

      taskDiv.querySelector('input').addEventListener('change', () => {
        t.completed = !t.completed;
        saveData();
        renderDashboard();
        updateSummary();
      });

      subCard.appendChild(taskDiv);
    });

    subjectDashboard.appendChild(subCard);
  });

  // TOP 5 URGENT TASKS
  const urgentTasks = tasks.filter(t => !t.completed)
                           .sort((a,b) => getUrgency(b) - getUrgency(a))
                           .slice(0,5);

  urgentTasks.forEach(t => {
    const div = document.createElement('div');
    div.classList.add('task-card', t.priority.toLowerCase());
    div.innerHTML = `<strong>${t.name}</strong> (${t.subject} - ${t.type}) | Due: ${t.due} | Priority: ${t.priority}`;
    urgentTasksDiv.appendChild(div);
  });
}

// -----------------------------
// UPDATE SUMMARY
// -----------------------------
function updateSummary() {
  totalSubjects.textContent = subjects.length;
  totalTasks.textContent = tasks.length;
  const today = new Date().toISOString().split('T')[0];
  const dueToday = tasks.filter(t => t.due === today && !t.completed).length;
  tasksToday.textContent = dueToday;
}

// -----------------------------
// INITIAL RENDER
// -----------------------------
renderSubjects();
renderDashboard();
updateSummary();
