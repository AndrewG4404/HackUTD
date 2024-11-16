import numpy as np
import pandas as pd
from keras.models import Sequential
from keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
import requests
import datetime

# Fetch Historical Data
def fetch_crypto_data(coin: str, vs_currency: str = 'usd', days: int = 90):
    """
    Fetch historical price data for a specific cryptocurrency.
    """
    url = f"https://api.coingecko.com/api/v3/coins/{coin}/market_chart"
    params = {'vs_currency': vs_currency, 'days': days}
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        prices = response.json()['prices']
        df = pd.DataFrame(prices, columns=['timestamp', 'price'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    else:
        raise Exception(f"Failed to fetch data: {response.status_code} - {response.text}")

# Prepare Data for LSTM
def prepare_data(data: pd.DataFrame, look_back: int = 60):
    """
    Prepare data for LSTM model by creating sequences.
    """
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data['price'].values.reshape(-1, 1))
    
    X, y = [], []
    for i in range(look_back, len(scaled_data)):
        X.append(scaled_data[i-look_back:i, 0])
        y.append(scaled_data[i, 0])
    
    return np.array(X), np.array(y), scaler

# Build the LSTM Model
def build_model(input_shape):
    """
    Build and compile the LSTM model.
    """
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=input_shape),
        LSTM(50, return_sequences=False),
        Dense(25),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# Train the Model
def train_model(coin: str, days: int = 90, epochs: int = 10, batch_size: int = 32):
    """
    Fetch data, prepare it, and train an LSTM model for prediction.
    """
    data = fetch_crypto_data(coin, days=days)
    X, y, scaler = prepare_data(data)
    X = X.reshape((X.shape[0], X.shape[1], 1))  # Reshape for LSTM

    model = build_model((X.shape[1], 1))
    model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=1)

    return model, scaler, data

# Make Predictions
def predict_prices(model, scaler, data: pd.DataFrame, future_days: int = 7):
    """
    Predict future prices using the trained model.
    """
    look_back = 60  # Sequence length
    last_look_back = data['price'][-look_back:].values.reshape(-1, 1)
    scaled_last_look_back = scaler.transform(last_look_back)

    predictions = []
    input_seq = scaled_last_look_back

    for _ in range(future_days):
        input_seq = input_seq.reshape((1, look_back, 1))
        predicted_price = model.predict(input_seq)[0][0]
        predictions.append(predicted_price)
        
        # Append the prediction to the sequence and slide the window
        input_seq = np.append(input_seq[:, 1:, :], [[predicted_price]], axis=1)

    predicted_prices = scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
    future_dates = [data['timestamp'].iloc[-1] + datetime.timedelta(days=i) for i in range(1, future_days + 1)]
    
    return pd.DataFrame({'date': future_dates, 'predicted_price': predicted_prices.flatten()})

#Train and using the model
from models.crypto_predictor import train_model

coin = "bitcoin"
model, scaler, data = train_model(coin, days=90, epochs=5)

#Predictions
from models.crypto_predictor import predict_prices

future_predictions = predict_prices(model, scaler, data, future_days=7)
print(future_predictions)

