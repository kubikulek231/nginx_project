import subprocess
import json
import os
from concurrent.futures import ThreadPoolExecutor

# constants
JSON_CONFIG_FILE_PATH = "html/video_conf.json"

TARGET = "rtmp://localhost/hls/"

V_CODEC = "libx264"
A_CODEC = "aac"

AUDIO_PATH = "audio/"
THUMBNAIL_DIR = "thumbnails/"

DEBUG = True

MAX_ID = 1

# json error handling
try:
    with open(JSON_CONFIG_FILE_PATH, 'r') as file:
        json_content = file.read()
        loaded_sources = json.loads(json_content)
except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
except FileNotFoundError:
    print(f"File not found: {JSON_CONFIG_FILE_PATH}")
except Exception as e:
    print(f"Error: {e}")

command_list = []

for source in loaded_sources:
    id = source['source_id']
    target = TARGET + "source_" + str(id)
    audio_filename = os.path.join(AUDIO_PATH, source['audio_filename'])
    video_path = source['video_path']
    thumbnail_path = os.path.join(THUMBNAIL_DIR, f"source_{id}.jpg")
    
    # create custom ffmpeg command using the loaded parameters
    command = [
        "ffmpeg.exe",
        "-stream_loop", "-1", "-i", video_path,
        "-stream_loop", "-1", "-i", audio_filename,
        "-threads", "2",
        "-preset", "veryfast",
        "-c:a", A_CODEC, "-b:a", "128k", 
        "-c:v", V_CODEC, "-b:v", "2048k", "-s:v", "1280x720", "-f:v", "flv", f"{target}_stream_720",
        "-c:v", V_CODEC, "-b:v", "448k", "-s:v", "854x480", "-f:v", "flv", f"{target}_stream_480",
        "-c:v", V_CODEC, "-b:v", "288k", "-s:v", "640x360", "-f:v", "flv", f"{target}_stream_360",
        "-vf", f"fps=fps=1, scale=400:255",
        "-update", "1", "-y", thumbnail_path,
        "-f", "image2",
    ]


    command_list.append(command)
    if id == MAX_ID:
        break

def run_command(command):
    print("executing ffmpeg command...")
    try:
        if DEBUG:
            subprocess.run(command, check=True, shell=True)
        else: 
            subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True, shell=True)
    except subprocess.CalledProcessError:
        print(f"Command failed: {' '.join(command)}")

# run ffmpeg commands concurrently via ThreadPoolExecutor
with ThreadPoolExecutor() as executor:
    executor.map(run_command, command_list)

