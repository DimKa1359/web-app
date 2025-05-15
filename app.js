document.addEventListener('DOMContentLoaded', function() { 
    initData(); 

    if (document.getElementById('planesTable')) { 
        loadPlanes(); 
        setupPlaneForm(); 
    }
    
    if (document.getElementById('flightsTable')) {
        loadFlights();
        setupFlightForm();
        setupFlightSearch();
    }
    
    if (document.getElementById('passengersTable')) {
        loadPassengers();
        setupPassengerForm();
        setupPassengerSearch();
    }
});

function initData() {
    if (!localStorage.getItem('planes')) { //есть ли в localStorage ключ 'planes'. Если нет — выполняется инициализация
        const initialPlanes = [
            { id: 1, number: "RA-12345", model: "Boeing 737", capacity: 150 },
            { id: 2, number: "RA-54321", model: "Airbus A320", capacity: 180 }
        ];
        localStorage.setItem('planes', JSON.stringify(initialPlanes)); //Сохраняет начальные данные о самолётах в localStorage
    }

    if (!localStorage.getItem('flights')) {
        const initialFlights = [
            { id: 1, number: "SU-123", departure: "Москва", arrival: "Санкт-Петербург", time: "10:00", status: "По расписанию", planeId: 1 },
            { id: 2, number: "SU-456", departure: "Новосибирск", arrival: "Красноярск", time: "14:30", status: "Задержан", planeId: 2 }
        ];
        localStorage.setItem('flights', JSON.stringify(initialFlights));
    }

    if (!localStorage.getItem('passengers')) {
        const initialPassengers = [
            { id: 1, fullName: "Иванов Иван Иванович", passport: "1234567890", ticket: "SU-123-1", flightId: 1 },
            { id: 2, fullName: "Петров Петр Петрович", passport: "0987654321", ticket: "SU-123-2", flightId: 1 }
        ];
        localStorage.setItem('passengers', JSON.stringify(initialPassengers));
    }
}

// самолёт
function loadPlanes() {
    const planes = JSON.parse(localStorage.getItem('planes')); //Получает данные о самолётах из localStorage и преобразует их в массив объектов
    const table = document.getElementById('planesTable'); //Получает ссылку на таблицу, в которую будут выводиться данные
    table.innerHTML = ''; //Очищает содержимое таблицы перед новой загрузкой
    
    planes.forEach(plane => { //Перебирает все самолёты
        const row = document.createElement('tr'); //Создаёт новую строку таблицы (<tr>)
        //Заполняет строку данными о самолёте и кнопками управления
        row.innerHTML = ` 
            <td>${plane.number}</td>
            <td>${plane.model}</td>
            <td>${plane.capacity}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editPlane(${plane.id})">Изменить</button>
                <button class="btn btn-sm btn-danger" onclick="confirmDelete('plane', ${plane.id})">Удалить</button>
            </td>
        `;
        table.appendChild(row); //Добавляет строку в таблицу
    });
}

function setupPlaneForm() {
    const form = document.getElementById('planeForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault(); //Отменяет стандартное поведение формы (по умолчанию браузер перезагружает страницу при отправке формы)
        
        const planeId = document.getElementById('planeId').value; //Получает значение поля planeId
        if (planeId) {
            updatePlane(planeId);
        } else {
            addPlane();
        }
    });
}

function addPlane() {
    const planes = JSON.parse(localStorage.getItem('planes')); //Извлекает данные о самолётах из localStorage и преобразует их из строки JSON обратно в массив объектов
    const newId = planes.length > 0 ? Math.max(...planes.map(p => p.id)) + 1 : 1; //Вычисляет следующий доступный ID: если есть уже существующие самолёты — берёт максимальный ID и увеличивает на 1. Если нет — ставит 1
    
    const newPlane = {
        id: newId,
        number: document.getElementById('planeNumber').value,
        model: document.getElementById('planeModel').value,
        capacity: parseInt(document.getElementById('planeCapacity').value)
    };
    
    if (!validatePlane(newPlane)) return;
    
    planes.push(newPlane);
    localStorage.setItem('planes', JSON.stringify(planes));
    loadPlanes();
    document.getElementById('planeForm').reset();
}

function editPlane(id) {
    const planes = JSON.parse(localStorage.getItem('planes'));
    const plane = planes.find(p => p.id === id);
    
    if (plane) {
        document.getElementById('planeId').value = plane.id;
        document.getElementById('planeNumber').value = plane.number;
        document.getElementById('planeModel').value = plane.model;
        document.getElementById('planeCapacity').value = plane.capacity;
        
        document.getElementById('planeForm').scrollIntoView();
    }
}

function updatePlane(id) {
    let planes = JSON.parse(localStorage.getItem('planes'));
    const index = planes.findIndex(p => p.id === parseInt(id));
    
    if (index !== -1) {
        planes[index] = {
            id: parseInt(id),
            number: document.getElementById('planeNumber').value,
            model: document.getElementById('planeModel').value,
            capacity: parseInt(document.getElementById('planeCapacity').value)
        };
        
        if (!validatePlane(planes[index])) return;
        
        localStorage.setItem('planes', JSON.stringify(planes));
        loadPlanes();
        document.getElementById('planeForm').reset();
        document.getElementById('planeId').value = '';
    }
}
//-----------------------------------
function validatePlane(plane) {
    if (!plane.number || !plane.model || !plane.capacity) {
        alert('Все поля должны быть заполнены!');
        return false;
    }
    
    if (plane.capacity <= 0) {
        alert('Вместимость должна быть положительным числом!');
        return false;
    }
    
    return true;
}

// рейс
function loadFlights() {
    const flights = JSON.parse(localStorage.getItem('flights'));
    const planes = JSON.parse(localStorage.getItem('planes'));
    const table = document.getElementById('flightsTable');
    table.innerHTML = '';
    
    flights.forEach(flight => {
        const plane = planes.find(p => p.id === flight.planeId);
        const planeInfo = plane ? `${plane.model} (${plane.number})` : 'Не указан';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${flight.number}</td>
            <td>${flight.departure}</td>
            <td>${flight.arrival}</td>
            <td>${flight.time}</td>
            <td>${flight.status}</td>
            <td>${planeInfo}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editFlight(${flight.id})">Изменить</button>
                <button class="btn btn-sm btn-danger" onclick="confirmDelete('flight', ${flight.id})">Удалить</button>
            </td>
        `;
        table.appendChild(row);
    });
    

    updatePlaneSelect();
}

function setupFlightForm() {
    const form = document.getElementById('flightForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const flightId = document.getElementById('flightId').value;
        if (flightId) {
            updateFlight(flightId);
        } else {
            addFlight();
        }
    });
}

function setupFlightSearch() {
    document.getElementById('flightSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#flightsTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

function updatePlaneSelect() {
    const planes = JSON.parse(localStorage.getItem('planes'));
    const select = document.getElementById('flightPlane');
    select.innerHTML = '<option value="">Выберите самолет</option>';
    
    planes.forEach(plane => {
        const option = document.createElement('option');
        option.value = plane.id;
        option.textContent = `${plane.model} (${plane.number})`;
        select.appendChild(option);
    });
}

function addFlight() {
    const flights = JSON.parse(localStorage.getItem('flights'));
    const newId = flights.length > 0 ? Math.max(...flights.map(f => f.id)) + 1 : 1;
    
    const newFlight = {
        id: newId,
        number: document.getElementById('flightNumber').value,
        departure: document.getElementById('flightDeparture').value,
        arrival: document.getElementById('flightArrival').value,
        time: document.getElementById('flightTime').value,
        status: document.getElementById('flightStatus').value,
        planeId: parseInt(document.getElementById('flightPlane').value)
    };
    
    if (!validateFlight(newFlight)) return;
    
    flights.push(newFlight);
    localStorage.setItem('flights', JSON.stringify(flights));
    loadFlights();
    document.getElementById('flightForm').reset();
}

function editFlight(id) {
    const flights = JSON.parse(localStorage.getItem('flights'));
    const flight = flights.find(f => f.id === id);
    
    if (flight) {
        document.getElementById('flightId').value = flight.id;
        document.getElementById('flightNumber').value = flight.number;
        document.getElementById('flightDeparture').value = flight.departure;
        document.getElementById('flightArrival').value = flight.arrival;
        document.getElementById('flightTime').value = flight.time;
        document.getElementById('flightStatus').value = flight.status;
        document.getElementById('flightPlane').value = flight.planeId;
        
        document.getElementById('flightForm').scrollIntoView();
    }
}

function updateFlight(id) {
    let flights = JSON.parse(localStorage.getItem('flights'));
    const index = flights.findIndex(f => f.id === parseInt(id));
    
    if (index !== -1) {
        flights[index] = {
            id: parseInt(id),
            number: document.getElementById('flightNumber').value,
            departure: document.getElementById('flightDeparture').value,
            arrival: document.getElementById('flightArrival').value,
            time: document.getElementById('flightTime').value,
            status: document.getElementById('flightStatus').value,
            planeId: parseInt(document.getElementById('flightPlane').value)
        };
        
        if (!validateFlight(flights[index])) return;
        
        localStorage.setItem('flights', JSON.stringify(flights));
        loadFlights();
        document.getElementById('flightForm').reset();
        document.getElementById('flightId').value = '';
    }
}

function validateFlight(flight) {
    if (!flight.number || !flight.departure || !flight.arrival || !flight.time || !flight.status) {
        alert('Все поля должны быть заполнены!');
        return false;
    }
    
    if (flight.departure === flight.arrival) {
        alert('Пункт вылета и прилета не могут совпадать!');
        return false;
    }
    
    return true;
}

// пассажиры
function loadPassengers() {
    const passengers = JSON.parse(localStorage.getItem('passengers'));
    const flights = JSON.parse(localStorage.getItem('flights'));
    const table = document.getElementById('passengersTable');
    table.innerHTML = '';
    
    passengers.forEach(passenger => {
        const flight = flights.find(f => f.id === passenger.flightId);
        const flightInfo = flight ? `${flight.number} (${flight.departure} → ${flight.arrival})` : 'Не указан';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${passenger.fullName}</td>
            <td>${passenger.passport}</td>
            <td>${passenger.ticket}</td>
            <td>${flightInfo}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editPassenger(${passenger.id})">Изменить</button>
                <button class="btn btn-sm btn-danger" onclick="confirmDelete('passenger', ${passenger.id})">Удалить</button>
            </td>
        `;
        table.appendChild(row);
    });
    
    
    updateFlightSelect();
}

function setupPassengerForm() {
    const form = document.getElementById('passengerForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const passengerId = document.getElementById('passengerId').value;
        if (passengerId) {
            updatePassenger(passengerId);
        } else {
            addPassenger();
        }
    });
}

function setupPassengerSearch() {
    document.getElementById('passengerSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#passengersTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

function updateFlightSelect() {
    const flights = JSON.parse(localStorage.getItem('flights'));
    const select = document.getElementById('passengerFlight');
    select.innerHTML = '<option value="">Выберите рейс</option>';
    
    flights.forEach(flight => {
        const option = document.createElement('option');
        option.value = flight.id;
        option.textContent = `${flight.number} (${flight.departure} → ${flight.arrival})`;
        select.appendChild(option);
    });
}

function addPassenger() {
    const passengers = JSON.parse(localStorage.getItem('passengers'));
    const newId = passengers.length > 0 ? Math.max(...passengers.map(p => p.id)) + 1 : 1;
    
    const newPassenger = {
        id: newId,
        fullName: document.getElementById('passengerName').value,
        passport: document.getElementById('passengerPassport').value,
        ticket: document.getElementById('passengerTicket').value,
        flightId: parseInt(document.getElementById('passengerFlight').value)
    };
    
    if (!validatePassenger(newPassenger)) return;
    
    passengers.push(newPassenger);
    localStorage.setItem('passengers', JSON.stringify(passengers));
    loadPassengers();
    document.getElementById('passengerForm').reset();
}

function editPassenger(id) {
    const passengers = JSON.parse(localStorage.getItem('passengers'));
    const passenger = passengers.find(p => p.id === id);
    
    if (passenger) {
        document.getElementById('passengerId').value = passenger.id;
        document.getElementById('passengerName').value = passenger.fullName;
        document.getElementById('passengerPassport').value = passenger.passport;
        document.getElementById('passengerTicket').value = passenger.ticket;
        document.getElementById('passengerFlight').value = passenger.flightId;
        
        document.getElementById('passengerForm').scrollIntoView();
    }
}

function updatePassenger(id) {
    let passengers = JSON.parse(localStorage.getItem('passengers'));
    const index = passengers.findIndex(p => p.id === parseInt(id));
    
    if (index !== -1) {
        passengers[index] = {
            id: parseInt(id),
            fullName: document.getElementById('passengerName').value,
            passport: document.getElementById('passengerPassport').value,
            ticket: document.getElementById('passengerTicket').value,
            flightId: parseInt(document.getElementById('passengerFlight').value)
        };
        
        if (!validatePassenger(passengers[index])) return;
        
        localStorage.setItem('passengers', JSON.stringify(passengers));
        loadPassengers();
        document.getElementById('passengerForm').reset();
        document.getElementById('passengerId').value = '';
    }
}

function validatePassenger(passenger) {
    if (!passenger.fullName || !passenger.passport || !passenger.ticket || !passenger.flightId) {
        alert('Все поля должны быть заполнены!');
        return false;
    }
    
    if (passenger.passport.length < 10) {
        alert('Номер паспорта должен содержать не менее 10 символов!');
        return false;
    }
    
    return true;
}

//общие функции 
function confirmDelete(type, id) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        deleteRecord(type, id);
    }
}

function deleteRecord(type, id) {
    let records = JSON.parse(localStorage.getItem(type + 's'));
    records = records.filter(record => record.id !== id);
    localStorage.setItem(type + 's', JSON.stringify(records));
    
    if (type === 'plane') loadPlanes();
    if (type === 'flight') loadFlights();
    if (type === 'passenger') loadPassengers();
}