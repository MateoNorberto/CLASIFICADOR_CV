from flask import Flask, render_template, request, jsonify
import joblib
import PyPDF2
import docx2txt
import pytesseract
from PIL import Image
import re
import nltk
from nltk.corpus import stopwords

nltk.download("stopwords")
stop_words = set(stopwords.words("spanish"))

app = Flask(__name__)
model = joblib.load("model.pkl")
print("Modelo cargado correctamente.")

def clean_text(text):
    text = text.lower()
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'\d{9,}', '', text)
    text = re.sub(r'[^a-záéíóúñ\s]', '', text)
    tokens = [word for word in text.split() if word not in stop_words]
    return " ".join(tokens)

def extract_text_from_pdf(pdf_file):
    reader = PyPDF2.PdfReader(pdf_file)
    return "".join([page.extract_text() or "" for page in reader.pages])

def extract_text_from_docx(docx_file):
    return docx2txt.process(docx_file)

def extract_text_from_txt(txt_file):
    return txt_file.read().decode("utf-8")

def extract_text_from_image(image_file):
    image = Image.open(image_file)
    return pytesseract.image_to_string(image)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        try:
            file = request.files.get("cv")
            if not file:
                return jsonify({"error": "Archivo no enviado"}), 400

            filename = file.filename.lower()
            if filename.endswith(".pdf"):
                text = extract_text_from_pdf(file)
            elif filename.endswith(".docx"):
                text = extract_text_from_docx(file)
            elif filename.endswith(".txt"):
                text = extract_text_from_txt(file)
            elif filename.endswith((".png", ".jpg", ".jpeg")):
                text = extract_text_from_image(file)
            else:
                return jsonify({"error": "Tipo de archivo no soportado"}), 400

            cleaned_text = clean_text(text)
            prediction = model.predict([cleaned_text])[0]
            probability = model.predict_proba([cleaned_text]).max() * 100

            # Placeholder para cargo_detectado
            cargo_detectado = "No implementado aún"

            return jsonify({
                "prediction": prediction,
                "probability": round(probability, 2),
                "cargo": cargo_detectado
            })

        except Exception as e:
            return jsonify({"error": f"Error interno: {str(e)}"}), 500

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
