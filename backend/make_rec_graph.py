import pandas as pd
import spotipy
from sklearn.metrics.pairwise import cosine_similarity
from spotipy import SpotifyClientCredentials
from gensim.models import KeyedVectors

embeddings = KeyedVectors.load_word2vec_format('track_playlist_embeddings.emb')

track_embeddings = {node: embeddings[node] for node in embeddings.index_to_key if 'track' in node}

track_id = "spotify:track:5lT5IZWW3JQErXELJpQgJ9"

target_vector = track_embeddings[track_id].reshape(1, -1)

similarity = cosine_similarity(target_vector, list(track_embeddings.values()))

similarity_df = pd.DataFrame(similarity.flatten(), index=list(track_embeddings.keys()), columns=['distance'])

top_10_similar_tracks = similarity_df.sort_values(by='distance', ascending=False).head(10)

client_id = 'ba49d852852848bbbb736385c468dc9b'
client_secret = '35b87a749ca444babb8559914f1e6987'

credentials = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
sp = spotipy.Spotify(client_credentials_manager=credentials)

top_10_similar_tracks['track_name'] = [
    f"{sp.track(track_uri)['artists'][0]['name']} - {sp.track(track_uri)['name']}"
    for track_uri in top_10_similar_tracks.index
]

print(top_10_similar_tracks)
