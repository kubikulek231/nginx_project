import subprocess
import json
import os
from concurrent.futures import ThreadPoolExecutor

# constants

class consts:
    DEBUG = True
    MAX_ID = 1

    # paths, directories
    JSON_CONFIG_FILE_PATH = "site/video_conf.json"
    AUDIO_PATH = "site/audio/"
    THUMBNAIL_DIR = "site/thumbnails/"
    TARGET = "rtmp://localhost/hls/"

    # ffmpeg codecs
    V_CODEC = "libx264"
    A_CODEC = "aac"

    # video codec tuning
    TUNE = "zerolatency"
    # video codec preset
    PRESET = "ultrafast"
    # crf quality value
    CRF_VAL = "23"
    # group of pictures size
    GOP_VAL = "20"

    # hls playlist type
    HLS_PL_TYPE = "vod"
    # hls playlist size
    HLS_PL_SIZE = "10"
    # hls flags (delete segments every time)
    HLS_FLAGS = "delete_segments"

def run_command(command):
    print(f"[+] Executing ffmpeg command - {command}")
    try:
        if consts.DEBUG:
            subprocess.run(command, check=True, shell=True)
        else: 
            subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True, shell=True)
    except subprocess.CalledProcessError:
        print(f"[-] Command failed: {command}")

def main():
    try:
        with open(consts.JSON_CONFIG_FILE_PATH, 'r') as file:
            json_content = file.read()
            loaded_sources = json.loads(json_content)
    except json.JSONDecodeError as e:
        print(f"[-] Error decoding JSON: {e}")
    except FileNotFoundError:
        print(f"[-] File not found: {consts.JSON_CONFIG_FILE_PATH}")
    except Exception as e:
        print(f"[-] Error: {e}")

    command_list = []

    for source in loaded_sources:
        id = source['source_id']
        target = consts.TARGET + "source_" + str(id)
        audio_filename = os.path.join(consts.AUDIO_PATH, source['audio_filename'])
        video_path = source['video_path']
        thumbnail_path = os.path.join(consts.THUMBNAIL_DIR, f"source_{id}.jpg")

        # create custom ffmpeg command using the loaded parameters
        cmd_source = f"ffmpeg -y -i {video_path} -stream_loop -1 -i {audio_filename}"

        cmd_stream_1 = (
            f"-vf scale=1280:720 -b:v 2048k -c:v {consts.V_CODEC} -acodec {consts.A_CODEC} "
            f"-tune {consts.TUNE} -preset {consts.PRESET} -crf {consts.CRF_VAL} -g {consts.GOP_VAL} "
            f"-hls_playlist_type {consts.HLS_PL_TYPE} -hls_list_size {consts.HLS_PL_SIZE} -hls_flags {consts.HLS_FLAGS} "
            f"-f flv {target}_stream_720"
        )

        cmd_stream_2 = (
            f"-vf scale=-854:480 -b:v 2048k -c:v {consts.V_CODEC} -acodec {consts.A_CODEC} "
            f"-tune {consts.TUNE} -preset {consts.PRESET} -crf {consts.CRF_VAL} -g {consts.GOP_VAL} "
            f"-hls_playlist_type {consts.HLS_PL_TYPE} -hls_list_size {consts.HLS_PL_SIZE} -hls_flags {consts.HLS_FLAGS} "
            f"-f flv {target}_stream_480"
        )

        cmd_stream_3 = (
            f"-vf scale=640:360 -b:v 2048k -c:v {consts.V_CODEC} -acodec {consts.A_CODEC} "
            f"-tune {consts.TUNE} -preset {consts.PRESET} -crf {consts.CRF_VAL} -g {consts.GOP_VAL} "
            f"-hls_playlist_type {consts.HLS_PL_TYPE} -hls_list_size {consts.HLS_PL_SIZE} -hls_flags {consts.HLS_FLAGS} "
            f"-f flv {target}_stream_360"
        )

        cmd_thumbnail = f"-vf fps=fps=1,scale=400x225 -update 1 -y -q:v 1 {thumbnail_path}"

        # put whole command together
        cmd_full = f"{cmd_source} {cmd_stream_1} {cmd_stream_2} {cmd_stream_3} {cmd_thumbnail}"

        command_list.append(cmd_full)
        if id == consts.MAX_ID:
            break

    # run ffmpeg commands concurrently via ThreadPoolExecutor
    with ThreadPoolExecutor() as executor:
        executor.map(run_command, command_list)

if __name__ == '__main__':
    main()
    