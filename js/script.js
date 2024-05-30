//const apiUrl = 'https://apigestiontareas-production.up.railway.app';

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('https://apigestiontareas-production.up.railway.app/api/token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error de inicio de sesion');
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('task-container').style.display = 'block'; // Mostrar el contenedor de tareas
            fetchTasks();
        } else {
            alert('Error de inicio de sesion');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error de inicio de sesion');
    });
});

document.getElementById('create-task-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('No se encontró ningún token, inicie sesión nuevamente');
        return;
    }

    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const taskEmail = document.getElementById('task-email').value;
    const taskDate = document.getElementById('task-date').value;

    const requestBody = {
        titulo: taskTitle,
        descripcion: taskDescription,
        email: taskEmail
    };

    if (taskDate.trim()) { // Solo si taskDate no está vacío
        requestBody.fecha_expiracion = taskDate;
    }


    fetch('https://apigestiontareas-production.up.railway.app/api/tasks/', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo crear la tarea');
        }
        return response.json();
    })
    .then(data => {
        alert('Tarea creada exitosamente');
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-email').value = '';
        document.getElementById('task-date').value = '';
        fetchTasks();
        // Aquí podrías actualizar la interfaz de usuario para reflejar la nueva tarea creada
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo crear la tarea');
    });
});

// Función para obtener y mostrar las tareas
function fetchTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No se encontró ningún token, inicie sesión nuevamente');
        return;
    }

    fetch('https://apigestiontareas-production.up.railway.app/api/tasks/', {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudieron recuperar las tareas');
        }
        return response.json();
    })
    .then(data => {
        // Limpiar la tabla antes de agregar nuevas filas
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';

        // Iterar sobre los resultados y agregar cada tarea a la tabla
        data.results.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.id}</td>
                <td>${task.titulo}</td>
                <td>${task.descripcion}</td>
                <td>${task.email}</td>
                <td>${task.fecha_creacion}</td>
                <td>${task.fecha_actualizacion}</td>
                <td>${task.fecha_expiracion ? task.fecha_expiracion : 'N/A'}</td>
                <td>${task.expirada ? 'Expirada' : 'Vigente'}</td>
                <td>
                    <button onclick="editTask(${task.id})">Edit</button>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                </td>
            `;
            taskList.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudieron recuperar las tareas');
    });
}

// Función para obtener y mostrar las tareas
function fetchTasks(pageNumber = 1) { // Agrega un parámetro para el número de página, con un valor predeterminado de 1
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No se encontró ningún token, inicie sesión nuevamente');
        return;
    }

    fetch(`https://apigestiontareas-production.up.railway.app/api/tasks/?page=${pageNumber}`, { // Incluye el número de página en la URL de la solicitud GET
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudieron recuperar las tareas');
        }
        return response.json();
    })
    .then(data => {
        // Limpiar la tabla antes de agregar nuevas filas
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';

        // Iterar sobre los resultados y agregar cada tarea a la tabla
        data.results.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.id}</td>
                <td>${task.titulo}</td>
                <td>${task.descripcion}</td>
                <td>${task.email}</td>
                <td>${task.fecha_creacion}</td>
                <td>${task.fecha_actualizacion}</td>
                <td>${task.fecha_expiracion ? task.fecha_expiracion : 'N/A'}</td>
                <td>${task.expirada ? 'Expirada' : 'Vigente'}</td>
                <td>
                    <button onclick="editTask(${task.id})">Editar</button>
                    <button onclick="deleteTask(${task.id})">Eliminar</button>
                </td>
            `;
            taskList.appendChild(row);
        });

        // Actualizar el número de página mostrado en la interfaz
        const pageNumberElement = document.getElementById('page-number');
        pageNumberElement.textContent = `Page ${pageNumber}`;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudieron recuperar las tareas');
    });
}

// Event listeners para la navegación entre páginas
let currentPage = 1; // Página actual, inicializada en 1

document.getElementById('prev-page').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        fetchTasks(currentPage);
    }
});

document.getElementById('next-page').addEventListener('click', function() {
    currentPage++;
    fetchTasks(currentPage);
});

// Agregar un controlador de eventos para los botones "Delete"
// Función para eliminar una tarea
function deleteTask(taskId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No se encontró ningún token, inicie sesión nuevamente');
        return;
    }

    // Mostrar ventana emergente para confirmar la eliminación
    const confirmation = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
    if (!confirmation) {
        return; // Si el usuario cancela, no hacemos nada
    }

    fetch(`https://apigestiontareas-production.up.railway.app/api/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Token ${token}`,
        },
    })
    .then(response => {
        if (response.status === 204) {
            // La tarea se eliminó con éxito
            alert('Tarea eliminada exitosamente');
            fetchTasks(); // Actualizar la tabla de tareas
        } else {
            throw new Error('No se pudo eliminar la tarea');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo eliminar la tarea');
    });
}


let currentTaskId = null;

function editTask(taskId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No se encontró ningún token, inicie sesión nuevamente');
        return;
    }

    currentTaskId = taskId;

    fetch(`https://apigestiontareas-production.up.railway.app/api/tasks/${taskId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudieron recuperar los detalles de la tarea');
        }
        return response.json();
    })
    .then(task => {
        document.getElementById('edit-task-title').value = task.titulo || '';
        document.getElementById('edit-task-description').value = task.descripcion || '';
        document.getElementById('edit-task-date').value = task.fecha_expiracion || '';
        document.getElementById('edit-task-modal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudieron recuperar los detalles de la tarea');
    });
}

// Cerrar el modal
document.getElementById('close-modal').addEventListener('click', function() {
    document.getElementById('edit-task-modal').style.display = 'none';
});

// Guardar cambios de la tarea
document.getElementById('edit-task-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('No se encontró ningún token, inicie sesión nuevamente');
        return;
    }

    const taskTitle = document.getElementById('edit-task-title').value.trim();
    const taskDescription = document.getElementById('edit-task-description').value.trim();
    const taskDate = document.getElementById('edit-task-date').value.trim();

    if (!taskTitle && !taskDescription && !taskDate) {
        alert('Por favor complete al menos un campo');
        return;
    }

    const requestBody = {};
    if (taskTitle) requestBody.titulo = taskTitle;
    if (taskDescription) requestBody.descripcion = taskDescription;
    if (taskDate) requestBody.fecha_expiracion = taskDate;

    fetch(`https://apigestiontareas-production.up.railway.app/api/tasks/${currentTaskId}/`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo actualizar la tarea');
        }
        return response.json();
    })
    .then(data => {
        alert('Tarea actualizada exitosamente');
        document.getElementById('edit-task-modal').style.display = 'none';
        fetchTasks();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo actualizar la tarea');
    });
});
