from fastapi import FastAPI
from models.crypto_predictor import train_model, predict_prices

app = FastAPI()

# Train and Predict Endpoint
@app.post("/crypto/predict")
def get_crypto_predictions(coin: str, days: int = 90, future_days: int = 7):
    model, scaler, data = train_model(coin, days=days, epochs=5)
    predictions = predict_prices(model, scaler, data, future_days=future_days)
    return predictions.to_dict(orient="records")
