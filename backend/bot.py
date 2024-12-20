import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher, html
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo
from aiogram.enums import ChatAction

import joblib
import numpy as np
import pandas as pd
import spotipy
from gensim.models import KeyedVectors
from openai import OpenAI
import tensorflow as tf
from sklearn.metrics.pairwise import cosine_similarity
from spotipy import SpotifyClientCredentials

# Bot token can be obtained via https://t.me/BotFather
TOKEN = "..."

# All handlers should be attached to the Router (or Dispatcher)

dp = Dispatcher()

model = tf.keras.models.load_model('trained_model1.h5', custom_objects={'mse': tf.keras.losses.MeanSquaredError()})

openai_client = OpenAI(
    api_key="..."
)

scaler_X = joblib.load('scaler_X.pkl')
scaler_Y = joblib.load('scaler_Y.pkl')

client_id = '...'
client_secret = '...'

# Авторизация через spotipy
credentials = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
sp = spotipy.Spotify(client_credentials_manager=credentials)


@dp.message(CommandStart())
async def command_start_handler(message: Message) -> None:
    """
    This handler receives messages with `/start` command
    """
    await message.answer(f"Привіт! Очікую запит на пошук треків")


@dp.message()
async def echo_handler(message: Message) -> None:

    try:
        await message.bot.send_chat_action(
            chat_id=message.chat.id,
            action=ChatAction.TYPING,
        )

        print(message.text)

        embedding = openai_client.embeddings.create(input=[message.text], model="text-embedding-3-small").data[0].embedding

        embedding_scaled = scaler_X.transform(np.array(embedding).reshape(1, -1))

        # Делаем предсказание
        result = model.predict(embedding_scaled)

        result_denormalized = scaler_Y.inverse_transform(result)

        embeddings = KeyedVectors.load_word2vec_format('track_playlist_embeddings.emb')

        track_embeddings = {node: embeddings[node] for node in embeddings.index_to_key if 'track' in node}

        target_vector = result_denormalized.reshape(-1, 64)

        similarity = cosine_similarity(target_vector, list(track_embeddings.values()))

        similarity_df = pd.DataFrame(similarity.flatten(), index=list(track_embeddings.keys()), columns=['distance'])

        top_10_similar_tracks = similarity_df.sort_values(by='distance', ascending=False).head(10)

        top_10_similar_tracks['track_name'] = [
            f"{sp.track(track_uri)['artists'][0]['name']} - {sp.track(track_uri)['name']}"
            for track_uri in top_10_similar_tracks.index
        ]

        result_message = ""
        track_uri_list = []

        for i, row in top_10_similar_tracks.iterrows():
            result_message += f"👉 {row['track_name']}\n"
            track_uri_list.append(str(i).split(':')[-1])

        web_app_url = 'https://fluffy-pudding-9e4020.netlify.app/?tracks=' + ",".join(track_uri_list)

        print(web_app_url)

        await message.reply(result_message,
                            reply_markup=InlineKeyboardMarkup(inline_keyboard=[[
                                InlineKeyboardButton(
                                    text="Слухати", web_app=WebAppInfo(url=web_app_url)
                                ),
                            ]])
                            )
    except:
        await message.reply("error")


async def main() -> None:
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))

    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())
