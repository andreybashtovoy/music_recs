import pandas as pd
import networkx as nx
from node2vec import Node2Vec
import ast

tracks = pd.read_csv('final_tracks.csv')
tracks = tracks[tracks.popularity > 6]
tracks['playlist_uris'] = tracks['playlist_uris'].apply(ast.literal_eval)

G = nx.Graph()

for _, track in tracks.iterrows():
    if track["popularity"] < 10:
        continue

    for playlist_uri in track['playlist_uris']:
        G.add_edge(track.track_uri, playlist_uri, weight=track.popularity)

node2vec = Node2Vec(
    G,
    dimensions=64,
    walk_length=15,
    num_walks=100,
    p=1,
    q=1,
    workers=4
)

model = node2vec.fit(window=10, min_count=1, batch_words=4)

model.wv.save_word2vec_format('track_playlist_embeddings.emb')

track_embedding = model.wv['track_uri_example']
playlist_embedding = model.wv['playlist_uri_example']

embeddings = {node: model.wv[node] for node in G.nodes()}
embeddings_df = pd.DataFrame.from_dict(embeddings, orient='index')
