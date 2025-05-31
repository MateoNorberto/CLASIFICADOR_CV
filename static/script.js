document.getElementById("upload-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const div = document.getElementById("resultado");
    div.textContent = "Procesando...";

    try {
        const formData = new FormData(this);
        console.log("Enviando datos al servidor...");
        const response = await fetch("/", {
            method: "POST",
            body: formData
        });
        console.log("Respuesta recibida", response);

        if (!response.ok) {
            const errorData = await response.json();
            div.textContent = errorData.error || "Error desconocido en el servidor";
            return;
        }

        const result = await response.json();
        div.textContent = `Área: ${result.prediction} | Probabilidad: ${result.probability}%`;
        if (result.probability >= 80) {
            div.textContent += " ✅ Candidato Apto para Contratación";
        } else {
            div.textContent += " ❌ No Apto para Contratación";
        }
    } catch (error) {
        div.textContent = "Error al conectar con el servidor.";
        console.error("Error en fetch:", error);
    }
});
