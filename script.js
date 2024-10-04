// Select elements
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskInput = document.getElementById('new-task');
const todoTasks = document.getElementById('todo-tasks');
const doingTasks = document.getElementById('doing-tasks');
const doneTasks = document.getElementById('done-tasks');
const taskDateTimeInput = document.getElementById('task-datetime'); // Date-Time input
const taskColorInput = document.getElementById('task-color'); // Color input
const colorBox = document.getElementById('color-box'); // Color box element
const reminderValueInput = document.getElementById('reminder-value'); // Reminder value input
const reminderUnitSelect = document.getElementById('reminder-unit'); // Reminder unit select
const reminderModal = document.getElementById('reminder-modal'); // Reminder modal
const modalMessage = document.getElementById('modal-message'); // Modal message
const extendReminderBtn = document.getElementById('extend-reminder-btn'); // Extend button
const dismissReminderBtn = document.getElementById('dismiss-reminder-btn'); // Dismiss button
const modalClose = document.getElementById('modal-close'); // Modal close button

// Load the beep sound
const beepSound = new Audio('file:///Users/dc/Desktop/My%20Project/bip.mp3'); // Specify the path to your beep sound file

let reminderInterval; // To keep track of the reminder interval

// Function to update the color box based on the selected color
function updateColorBox() {
    colorBox.style.backgroundColor = taskColorInput.value; // Update color box background
}

// Add event listener to the color input to update the color box
taskColorInput.addEventListener('input', updateColorBox);

// Function to create a new task element
function createTaskElement(taskText, taskDateTime, taskColor, reminderTime) {
    const li = document.createElement('li');
    li.style.backgroundColor = taskColor; // Apply chosen color

    // Calculate text color based on background color
    const rgb = hexToRgb(taskColor);
    const textColor = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186 ? '#000000' : '#FFFFFF';

    // Format date-time string without the "T"
    const formattedDateTime = taskDateTime.replace("T", " at "); // Remove 'T' and replace with 'at'

    li.innerHTML = `
        <span style="color: ${textColor};">${taskText}</span>
        <span style="color: ${textColor};">${formattedDateTime} (Reminder: ${reminderTime})</span> <!-- Display reminder time -->
        <div>
            <button class="move-btn">Move</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    // Move task between categories
    li.querySelector('.move-btn').addEventListener('click', () => {
        if (todoTasks.contains(li)) {
            doingTasks.appendChild(li);
        } else if (doingTasks.contains(li)) {
            doneTasks.appendChild(li);
        } else if (doneTasks.contains(li)) {
            todoTasks.appendChild(li);
        }
    });

    // Delete task
    li.querySelector('.delete-btn').addEventListener('click', () => {
        li.parentElement.removeChild(li);
    });

    return li;
}

// Function to add a new task
function addTask() {
    const taskText = newTaskInput.value.trim();
    const taskDateTime = taskDateTimeInput.value; // Get selected date and time
    const taskColor = taskColorInput.value; // Get selected color
    const reminderValue = parseInt(reminderValueInput.value); // Get reminder value
    const reminderUnit = reminderUnitSelect.value; // Get reminder unit

    if (taskText !== "" && taskDateTime !== "") {
        const reminderTime = `${reminderValue} ${reminderUnit}`; // Create reminder time string
        const taskElement = createTaskElement(taskText, taskDateTime, taskColor, reminderTime);
        todoTasks.appendChild(taskElement);

        // Set reminder based on user-defined time
        setReminder(taskElement, taskDateTime, reminderValue, reminderUnit);
        
        // Clear input fields after adding task
        newTaskInput.value = "";
        taskDateTimeInput.value = "";
        taskColorInput.value = "#e9ecef"; // Reset the color picker
        reminderValueInput.value = ""; // Reset reminder value
        updateColorBox(); // Reset the color box to default color
    }
}

// Function to set reminder
function setReminder(taskElement, taskDateTime, reminderValue, reminderUnit) {
    let reminderTimeMs;

    // Calculate the reminder time in milliseconds based on selected unit
    switch (reminderUnit) {
        case 'seconds':
            reminderTimeMs = reminderValue * 1000;
            break;
        case 'minutes':
            reminderTimeMs = reminderValue * 60 * 1000;
            break;
        case 'hours':
            reminderTimeMs = reminderValue * 60 * 60 * 1000;
            break;
        case 'days':
            reminderTimeMs = reminderValue * 24 * 60 * 60 * 1000;
            break;
        case 'months':
            reminderTimeMs = reminderValue * 30 * 24 * 60 * 60 * 1000; // Approximate
            break;
        case 'years':
            reminderTimeMs = reminderValue * 365 * 24 * 60 * 60 * 1000; // Approximate
            break;
        default:
            reminderTimeMs = 0;
            break;
    }

    const taskTime = new Date(taskDateTime).getTime();
    const reminderTimestamp = taskTime - reminderTimeMs;

    const now = Date.now();
    if (reminderTimestamp > now) {
        setTimeout(() => {
            // Function to handle reminder alert
            showReminder(taskElement);
        }, reminderTimestamp - now);
    }
}

// Function to show reminder
function showReminder(taskElement) {
    beepSound.loop = true; // Repeat the sound
    beepSound.play(); // Start playing the beep sound

    modalMessage.innerText = `Reminder: ${taskElement.querySelector('span').innerText} is due soon!`; // Set modal message
    reminderModal.style.display = 'flex'; // Show modal

    // Extend reminder functionality
    extendReminderBtn.onclick = () => {
        reminderModal.style.display = 'none'; // Close modal
        beepSound.pause(); // Stop the current beep sound
        beepSound.currentTime = 0; // Reset the sound to the beginning
        setTimeout(() => {
            // Extend the reminder by 5 minutes
            const extendedValue = 5; // Extend by 5 minutes
            const extendedUnit = 'minutes'; // Set unit as minutes
            setReminder(taskElement, taskElement.querySelector('span').innerText.match(/\((.*?)\)/)[1], extendedValue, extendedUnit); // Use the original reminder time
        }, 0);
    };

    // Dismiss reminder functionality
    dismissReminderBtn.onclick = () => {
        reminderModal.style.display = 'none'; // Close modal
        beepSound.pause(); // Stop the beep sound
        beepSound.currentTime = 0; // Reset the sound to the beginning
    };

    // Close modal when the "x" is clicked
    modalClose.onclick = () => {
        reminderModal.style.display = 'none'; // Close modal
        beepSound.pause(); // Stop the beep sound
        beepSound.currentTime = 0; // Reset the sound to the beginning
    };
}

// Function to convert hex color to RGB
function hexToRgb(hex) {
    // Remove the '#' symbol if it's there
    hex = hex.replace(/^#/, '');
    // Convert the hex values to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { r, g, b };
}

// Add task when clicking the button
addTaskBtn.addEventListener('click', addTask);

// Add task when pressing 'Enter'
newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initial call to set the color box to the default color
updateColorBox();
