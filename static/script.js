
document.getElementById("upload-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const response = await fetch("/", {
        method: "POST",
        body: formData
    });
    const result = await response.json();
    const div = document.getElementById("resultado");
    if (result.error) {
        div.textContent = result.error;
    } else {
        div.textContent = `Área: ${result.prediction} | Probabilidad: ${result.probability}%`;
        if (result.probability >= 80) {
            div.textContent += " ✅ Candidato Apto para Contratación";
        } else {
            div.textContent += " ❌ No Apto para Contratación";
        }
    }
});
