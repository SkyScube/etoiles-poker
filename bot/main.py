import aiohttp
import discord
from discord.ext import commands
from discord import app_commands
import json
import os

# Config
TOKEN = os.getenv("DISCORD_BOT_TOKEN")
API = os.getenv("APP_URL", "http://localhost:3000")

class MyClient(commands.Bot):

    async def on_ready(self):
        print(f'Connecté en tant que {self.user}')
        try:
            synced = await self.tree.sync()
            print(f'Synced {len(synced)} commands to guild')
        except Exception as e:
            print(e)

intents = discord.Intents.default()
intents.members = True
client = MyClient(command_prefix="!", intents=intents)

@client.tree.command(name="create", description="Create a poker game")
@app_commands.describe(numberofplayer="Number of player in the game", numberofchips="Number of chips for each player")
async def create(interaction: discord.Interaction, numberofplayer: int, numberofchips: int):
    if numberofchips<1000:
        await interaction.response.send_message("Can't have less than 1000 chips")
    elif numberofplayer<2:
        await interaction.response.send_message("Can't have less than 2 players")
    elif numberofplayer>6:
        await interaction.response.send_message("Can't have more than 6 players")
    else:
        payload = {"NbPlayer": numberofplayer, "NbChips": numberofchips}
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(API+"/api/game/create", json=payload) as resp:
                    print(resp.url)
                    if resp.status == 200:
                        data = await resp.json()  # maintenant c'est bien un JSON
                        url_room = data.get("url", "URL non disponible")
                        await interaction.followup.send(
                            f"Game created, url there : {url_room}")
                    else:
                        await interaction.followup.send(f"Error : {resp.status}")
        except Exception as e:
            await interaction.followup.send(f"Error : {e}")

client.run(TOKEN)