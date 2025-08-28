import aiohttp
import discord
from discord.ext import commands
from discord import app_commands
import json
import os
from dotenv import load_dotenv

# Config
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
TOKEN = os.getenv("DISCORD_BOT_TOKEN")
API = os.getenv("APP_URL", "http://localhost:3000")
print(TOKEN)
class MyClient(commands.Bot):

    async def on_ready(self):
        print("🤖 Bot connecté avec succès !")
        print(f"   → Utilisateur : {self.user} (ID: {self.user.id})")
        print(f"   → Nombre de guilds : {len(self.guilds)}")
        print(f"   → Nombre d’utilisateurs : {len(set(self.get_all_members()))}")
        print(f"   → Latence : {round(self.latency * 1000)}ms")
        try:
            synced = await self.tree.sync()
            print(f"✅ Slash commands synchronisées : {len(synced)}")
            for cmd in synced:
                print(f"   • /{cmd.name} – {cmd.description}")
        except Exception as e:
            print(f"❌ Erreur lors de la sync des commandes : {e}")

intents = discord.Intents.default()
intents.members = True
client = MyClient(command_prefix="!", intents=intents)

@client.tree.command(name="create", description="Create a poker game")
@app_commands.describe(
    numberofplayer="Number of players in the game (2-6)",
    numberofchips="Number of chips for each player (>= 1000)"
)
async def create(interaction: discord.Interaction, numberofplayer: int, numberofchips: int):
    # validations rapides
    if numberofchips < 1000:
        await interaction.response.send_message("Can't have less than 1000 chips", ephemeral=True)
        return
    if numberofplayer < 2:
        await interaction.response.send_message("Can't have less than 2 players", ephemeral=True)
        return
    if numberofplayer > 6:
        await interaction.response.send_message("Can't have more than 6 players", ephemeral=True)
        return

    # empêcher l’expiration du webhook
    await interaction.response.defer(thinking=True)

    payload = {"NbPlayer": numberofplayer, "NbChips": numberofchips}

    try:
        timeout = aiohttp.ClientTimeout(total=10)  # 10s
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(f"{API}/api/game/create", json=payload) as resp:
                # status non-200
                if resp.status != 200:
                    text = await resp.text()
                    await interaction.followup.send(f"Error: HTTP {resp.status} → {text}")
                    return

                data = await resp.json()
                url_room = data.get("url")  # <-- l’API doit renvoyer 'url'
                if not url_room:
                    await interaction.followup.send("Game created but no URL returned by API.")
                    return

                await interaction.followup.send(f"Game created, join here: {url_room}")
    except Exception as e:
        await interaction.followup.send(f"Error while creating the game: {e}")

@client.tree.command(name="ping", description="Responds with a pong")
async def ping(interaction: discord.Interaction):
    await interaction.response.send_message("🏓 Pong!")



client.run(TOKEN)