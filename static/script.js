const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg"
];

document.getElementById("upload-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const div = document.getElementById("resultado");
    div.textContent = "Procesando...";

    const file = this.cv.files[0];
    if (!allowedTypes.includes(file.type)) {
        div.textContent = "Tipo de archivo no permitido. Solo PDF, Word, TXT o imagen.";
        return;
    }

    try {
        const formData = new FormData(this);
        const response = await fetch("/", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            div.textContent = errorData.error || "Error desconocido en el servidor";
            return;
        }

        const result = await response.json();
        div.innerHTML = `
            <strong>Área:</strong> ${result.prediction}<br>
            <strong>Cargo detectado en el CV:</strong> ${result.cargo || "No especificado"}<br>
            <strong>Probabilidad:</strong> ${result.probability}%<br>
            ${result.probability >= 80 
            ? '<span style="color:green;">✅ ¡Felicidades! Eres un candidato apto para contratación.</span>' 
            : '<span style="color:red;">❌ Lo sentimos, no cumples con los requisitos para contratación.</span>'}
        `;
    } catch (error) {
        div.textContent = "Error al conectar con el servidor.";
        console.error("Error en fetch:", error);
    }
});
