from flask import Flask, render_template, request, jsonify
import joblib
import PyPDF2

app = Flask(__name__)
model = joblib.load("model.pkl")
print("Modelo cargado correctamente")  # <-- Confirmamos que el modelo se cargó bien

def extract_text_from_pdf(pdf_file):
    reader = PyPDF2.PdfReader(pdf_file)
    return "".join([page.extract_text() for page in reader.pages])

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        print("Petición POST recibida")  # << Esto confirma que el servidor recibe la petición
        try:
            file = request.files.get("cv")
            if file and file.filename.endswith(".pdf"):
                print(f"Archivo recibido: {file.filename}")
                text = extract_text_from_pdf(file)
                prediction = model.predict([text])[0]
                probability = model.predict_proba([text]).max() * 100
                return jsonify({"prediction": prediction, "probability": round(probability, 2)})
            else:
                print("Archivo inválido o no enviado")
                return jsonify({"error": "Archivo inválido"}), 400
        except Exception as e:
            print(f"Error interno: {str(e)}")
            return jsonify({"error": f"Error interno: {str(e)}"}), 500
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
