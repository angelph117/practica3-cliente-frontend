
const API_URL = 'http://localhost:3000/api/alumnos';

let grafica = null;

async function cargarAlumnos() {
    const tabla = document.getElementById('tabla-datos');
    const mensaje = document.getElementById('mensaje');

    try {
        mensaje.textContent = 'Conectando con la API...';

        // Solicitar los alumnos al backend
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        // Aceptar una respuesta que sea un arreglo
        // o un objeto que contenga la propiedad alumnos
        const alumnos = Array.isArray(datos)
            ? datos
            : datos.alumnos;

        if (!Array.isArray(alumnos)) {
            throw new Error(
                'La API no devolvió una lista de alumnos. Revisa su respuesta JSON.'
            );
        }

        // Limpiar la tabla anterior
        tabla.replaceChildren();

        if (alumnos.length === 0) {
            const fila = document.createElement('tr');
            const celda = document.createElement('td');

            celda.colSpan = 3;
            celda.textContent = 'No hay alumnos registrados.';
            fila.appendChild(celda);
            tabla.appendChild(fila);
        } else {
            // Crear las filas dinámicamente
            alumnos.forEach((alumno) => {
                const fila = document.createElement('tr');

                const celdaId = document.createElement('td');
                const celdaNombre = document.createElement('td');
                const celdaCarrera = document.createElement('td');

                celdaId.textContent = alumno.id ?? '';
                celdaNombre.textContent = alumno.nombre ?? '';
                celdaCarrera.textContent = alumno.carrera ?? '';

                fila.append(
                    celdaId,
                    celdaNombre,
                    celdaCarrera
                );

                tabla.appendChild(fila);
            });
        }

        // Actualizar las tarjetas de resumen
        document.getElementById('total-alumnos').textContent =
            alumnos.length;

        // Contar alumnos por carrera
        const conteoCarreras = {};

        alumnos.forEach((alumno) => {
            const carrera = alumno.carrera || 'Sin carrera registrada';

            conteoCarreras[carrera] =
                (conteoCarreras[carrera] || 0) + 1;
        });

        document.getElementById('total-carreras').textContent =
            Object.keys(conteoCarreras).length;

        // Preparar los datos para Chart.js
        const etiquetas = Object.keys(conteoCarreras);
        const cantidades = Object.values(conteoCarreras);

        // Si se vuelve a cargar la información, destruir
        // la gráfica anterior antes de crear otra
        if (grafica) {
            grafica.destroy();
        }

        const contexto = document
            .getElementById('miGrafica')
            .getContext('2d');

        grafica = new Chart(contexto, {
            type: 'bar',

            data: {
                labels: etiquetas,

                datasets: [{
                    label: 'Cantidad de alumnos',
                    data: cantidades,
                    backgroundColor: '#4388d6',
                    borderColor: '#245b96',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        },
                        title: {
                            display: true,
                            text: 'Número de alumnos'
                        }
                    },

                    x: {
                        title: {
                            display: true,
                            text: 'Carrera'
                        }
                    }
                },

                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });

        mensaje.textContent =
            `Datos cargados correctamente: ${alumnos.length} alumno(s).`;

    } catch (error) {
        console.error('Error al cargar los alumnos:', error);

        tabla.replaceChildren();

        const fila = document.createElement('tr');
        const celda = document.createElement('td');

        celda.colSpan = 3;
        celda.textContent = 'No fue posible cargar los datos.';

        fila.appendChild(celda);
        tabla.appendChild(fila);

        document.getElementById('total-alumnos').textContent = '—';
        document.getElementById('total-carreras').textContent = '—';

        mensaje.textContent =
            `Error: ${error.message}. Verifica que el backend esté funcionando.`;
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarAlumnos);
