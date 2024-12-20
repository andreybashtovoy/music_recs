import json
import joblib
import numpy as np
import tensorflow as tf
from keras.src.losses import CosineSimilarity
from sklearn.preprocessing import StandardScaler
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from gensim.models import KeyedVectors

input_dim = 1536
output_dim = 64

track_embeddings_node2vec = KeyedVectors.load_word2vec_format('track_playlist_embeddings.emb')

with open('embeddings.json', 'r') as f:
    playlist_embeddings_text = json.load(f)

X = []
Y = []

for playlist_uri, playlist_embedding in playlist_embeddings_text.items():
    try:
        playlist_node2vec_embedding = track_embeddings_node2vec[playlist_uri]
    except KeyError:
        continue

    if playlist_node2vec_embedding is not None:
        X.append(playlist_embedding)
        Y.append(playlist_node2vec_embedding)

X = np.array(X)
Y = np.array(Y)

scaler_X = StandardScaler()
scaler_Y = StandardScaler()
X = scaler_X.fit_transform(X)
Y = scaler_Y.fit_transform(Y)

joblib.dump(scaler_X, 'scaler_X.pkl')
joblib.dump(scaler_Y, 'scaler_Y.pkl')

dataset = tf.data.Dataset.from_tensor_slices((X, Y))

train_size = int(0.8 * len(X))
val_size = len(X) - train_size
train_dataset = dataset.take(train_size).shuffle(train_size).batch(32)
val_dataset = dataset.skip(train_size).batch(32)

model = Sequential([
    Dense(512, activation='relu'),
    Dropout(0.2),
    Dense(512, activation='relu'),
    Dropout(0.2),
    Dense(output_dim, activation='linear')
])

model.compile(optimizer='adam', loss='mean_squared_error', metrics=[CosineSimilarity()])

early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=30,
    callbacks=[early_stopping]
)

model.save('trained_model.h5')

print("Обучение завершено и модель сохранена.")
