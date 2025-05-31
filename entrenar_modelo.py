from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
import joblib

X_train = [
    "Experiencia en desarrollo web y frontend",
    "Conocimientos en análisis de datos y machine learning",
    "Diseño gráfico y manejo de herramientas de diseño",
    "Programación en Python y desarrollo de APIs",
    "Marketing digital y SEO",
    "Administración y gestión de proyectos"
]

y_train = [
    "Desarrollo",
    "Data Science",
    "Diseño",
    "Desarrollo",
    "Marketing",
    "Administración"
]

model = make_pipeline(TfidfVectorizer(), LogisticRegression())

model.fit(X_train, y_train)

joblib.dump(model, "model.pkl")

print("¡Modelo entrenado y guardado como model.pkl!")
