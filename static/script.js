const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/png",
    "image/jpeg"
];
const MAX_SIZE_MB = 5;

const form = document.getElementById("upload-form");
const resultado = document.getElementById("resultado");
const preview = document.getElementById("preview");
const progressBar = document.getElementById("progress-bar");
const listaHistorial = document.getElementById("lista-historial");

// Vista previa archivo
document.querySelector('input[name="cv"]').addEventListener("change", function () {
    const file = this.files[0];
    preview.innerHTML = "";

    if (!file) {
        preview.textContent = "Selecciona un archivo para ver la vista previa aquí.";
        return;
    }

    if (file.type === "application/pdf") {
        // PDF: iframe para preview
        const fileURL = URL.createObjectURL(file);
        preview.innerHTML = `<iframe src="${fileURL}" width="100%" height="500px"></iframe>`;
    } else if (file.type.startsWith("image/")) {
        // Imagen: mostrar imagen
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa del CV" style="max-width: 100%; height: auto;" />`;
        };
        reader.readAsDataURL(file);
    } else if (file.type === "text/plain") {
        // TXT: mostrar texto (primeros 500 caracteres)
        const reader = new FileReader();
        reader.onload = e => {
            const text = e.target.result.slice(0, 500);
            preview.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word;">${text}${e.target.result.length > 500 ? "\n\n[Contenido truncado]" : ""}</pre>`;
        };
        reader.readAsText(file);
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
        // DOCX: mostrar mensaje con icono (sin preview real)
        preview.innerHTML = `<p>📄 Archivo Word: <strong>${file.name}</strong><br>No se puede mostrar vista previa en el navegador.</p>`;
    } else {
        // Otros tipos: mostrar mensaje genérico
        preview.innerHTML = `<p>📄 Archivo: <strong>${file.name}</strong><br>No se puede mostrar vista previa.</p>`;
    }
});

// Submit form
form.addEventListener("submit", async function (e) {
    e.preventDefault();
    resultado.textContent = "Procesando...";
    progressBar.style.width = "50%";

    const file = this.cv.files[0];

    if (!file || !allowedTypes.includes(file.type)) {
        resultado.textContent = "❌ Tipo de archivo no permitido.";
        progressBar.style.width = "0";
        return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        resultado.textContent = `❌ Archivo muy grande. Máx: ${MAX_SIZE_MB}MB`;
        progressBar.style.width = "0";
        return;
    }

    try {
        const formData = new FormData(this);
        const response = await fetch("/", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        progressBar.style.width = "100%";

        if (!response.ok) {
            resultado.textContent = result.error || "Error desconocido.";
            return;
        }

        resultado.innerHTML = `
            <strong>Área:</strong> ${result.prediction}<br>
            <strong>Cargo:</strong> ${result.cargo || "No especificado"}<br>
            <strong>Probabilidad:</strong> ${result.probability}%<br>
            ${result.probability >= 34 
                ? '<span style="color:green;">✅ Apto para contratación.</span>' 
                : '<span style="color:red;">❌ No cumple los requisitos.</span>'}
        `;

        guardarHistorial(file.name, result);
        mostrarHistorial();
    } catch (error) {
        resultado.textContent = "❌ Error al conectar con el servidor.";
        console.error("Error:", error);
    } finally {
        setTimeout(() => progressBar.style.width = "0", 1000);
    }
});

// Guardar historial en localStorage
function guardarHistorial(nombreArchivo, data) {
    let historial = JSON.parse(localStorage.getItem("historial_cv")) || [];
    historial.unshift({
        fecha: new Date().toLocaleString(),
        archivo: nombreArchivo,
        prediction: data.prediction,
        cargo: data.cargo,
        probability: data.probability
    });
    localStorage.setItem("historial_cv", JSON.stringify(historial));
}

// Mostrar historial
function mostrarHistorial() {
    const historial = JSON.parse(localStorage.getItem("historial_cv")) || [];
    listaHistorial.innerHTML = "";

    if (!historial.length) {
        listaHistorial.innerHTML = "<li>No hay registros aún.</li>";
        return;
    }

    historial.slice(0, 5).forEach(item => {
        const li = document.createElement("li");
        li.textContent = `📄 ${item.archivo} → ${item.prediction} (${item.probability}%)`;
        listaHistorial.appendChild(li);
    });
}

window.onload = mostrarHistorial;
