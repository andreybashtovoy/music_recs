import joblib
import numpy as np
import pandas as pd
import spotipy
from gensim.models import KeyedVectors
from openai import OpenAI
import tensorflow as tf
from sklearn.metrics.pairwise import cosine_similarity
from spotipy import SpotifyClientCredentials

model = tf.keras.models.load_model('trained_model123.h5', custom_objects={'mse': tf.keras.losses.MeanSquaredError()})

prompt = "Classic Essentials"

openai_client = OpenAI(
    api_key="..."
)

scaler_X = joblib.load('scaler_X.pkl')
scaler_Y = joblib.load('scaler_Y.pkl')

embedding = openai_client.embeddings.create(input=[prompt], model="...").data[0].embedding

embedding_scaled = scaler_X.transform(np.array(embedding).reshape(1, -1))

result = model.predict(embedding_scaled)

result_denormalized = scaler_Y.inverse_transform(result)

embeddings = KeyedVectors.load_word2vec_format('track_playlist_embeddings.emb')

track_embeddings = {node: embeddings[node] for node in embeddings.index_to_key if 'track' in node}

target_vector = result_denormalized.reshape(-1, 64)

similarity = cosine_similarity(target_vector, list(track_embeddings.values()))

similarity_df = pd.DataFrame(similarity.flatten(), index=list(track_embeddings.keys()), columns=['distance'])

top_10_similar_tracks = similarity_df.sort_values(by='distance', ascending=False).head(10)

client_id = '...'
client_secret = '...'

credentials = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
sp = spotipy.Spotify(client_credentials_manager=credentials)

top_10_similar_tracks['track_name'] = [
    f"{sp.track(track_uri)['artists'][0]['name']} - {sp.track(track_uri)['name']}"
    for track_uri in top_10_similar_tracks.index
]

print(f'Search results for the query "{prompt}")
print(top_10_similar_tracks)
