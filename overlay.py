"""
Kanji Quiz Overlay — Desktop Window
System tray app with Python-native IRC + timer.
When triggered, shows a popup quiz window you can interact with.
The popup hides when the quiz ends — zero interference with games.
"""

import webview
import subprocess
import sys
import os
import socket
import ssl
import json
import time
import re
import random
import threading
from urllib.parse import urlencode
import pystray
from PIL import Image, ImageDraw, ImageFont

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UI_DIR = os.path.join(BASE_DIR, 'ui')
CONFIG_FILE = os.path.join(BASE_DIR, 'config.json')
PORT = 8080
server_proc = None
is_shutting_down = False

# --- Config file ---
def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_config(data):
    cfg = load_config()
    cfg.update(data)
    with open(CONFIG_FILE, 'w') as f:
        json.dump(cfg, f, indent=2)
    return cfg

config = load_config()

# --- Local HTTP server ---
def port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def find_open_port(start_port=8080, max_port=8999):
    for port in range(start_port, max_port + 1):
        if not port_in_use(port):
            return port
    raise RuntimeError('No open TCP port found for local UI server.')

def wait_for_port(port, timeout_seconds=5):
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        if port_in_use(port):
            return True
        time.sleep(0.1)
    return False

def start_server():
    global PORT, server_proc
    PORT = find_open_port(PORT)
    server_proc = subprocess.Popen(
        [sys.executable, '-m', 'http.server', str(PORT)],
        cwd=UI_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if not wait_for_port(PORT):
        raise RuntimeError(f'Local UI server failed to start on port {PORT}.')

start_server()

def build_url(mode):
    params = {'mode': mode}
    if config.get('renshuu_api_key'):
        params['renshuu_key'] = config['renshuu_api_key']
    return f'http://localhost:{PORT}/index.html?{urlencode(params)}'

# --- Window geometry ---
MONITOR_W, MONITOR_H = 3840, 2160
WIN_W, WIN_H = 700, 400
WIN_X = (MONITOR_W - WIN_W) // 2
WIN_Y = (MONITOR_H - WIN_H) // 2

# --- Quiz state ---
quiz_window = None
quiz_visible = False
quiz_active = False
last_quiz_time = 0
COOLDOWN_SECONDS = 5 * 60
INTERVAL_SECONDS = 15 * 60

# --- Quiz trigger logic (Python-native) ---
def trigger_quiz(skip_cooldown=False):
    global quiz_active, last_quiz_time, quiz_visible
    if quiz_active or quiz_visible:
        print('[Quiz] Already active, skipping')
        return
    now = time.time()
    if not skip_cooldown and (now - last_quiz_time) < COOLDOWN_SECONDS:
        remaining = int(COOLDOWN_SECONDS - (now - last_quiz_time))
        print(f'[Quiz] Cooldown active — {remaining}s remaining')
        return
    quiz_active = True
    last_quiz_time = now
    print('[Quiz] Triggering quiz...')
    # Run on a separate thread so we don't block IRC/timer
    threading.Thread(target=api.open_quiz, daemon=True).start()

class Api:
    def open_quiz(self):
        """Show the pre-loaded popup and tell it to start a new quiz."""
        global quiz_visible
        if quiz_window is None or quiz_visible:
            return
        quiz_visible = True
        try:
            quiz_window.on_top = True
            quiz_window.show()
            quiz_window.evaluate_js('setTimeout(resetAndStartQuiz, 50)')
            print('[Python] Quiz popup shown')
        except Exception as e:
            print(f'[Python] Error showing quiz: {e}')
            quiz_visible = False

    def close_quiz(self):
        """Hide the popup (keeps it loaded for instant re-open)."""
        global quiz_visible, quiz_active
        quiz_visible = False
        quiz_active = False
        def _hide():
            try:
                if quiz_window is not None:
                    quiz_window.on_top = False
                    quiz_window.hide()
            except Exception as e:
                print(f'[Python] Error hiding quiz: {e}')
            print('[Python] Quiz hidden, ready for next trigger')
        threading.Thread(target=_hide, daemon=True).start()

    def save_settings(self, twitch_channel, renshuu_key):
        global config
        config = save_config({
            'twitch_channel': twitch_channel,
            'renshuu_api_key': renshuu_key,
        })
        return True

    def get_settings(self):
        return json.dumps(config)

api = Api()

# --- Twitch IRC (Python-native, raw IRC over SSL) ---
PRIVMSG_RE = re.compile(r':(\S+)!\S+@\S+\s+PRIVMSG\s+#\S+\s+:(.+)')

def irc_thread():
    channel = config.get('twitch_channel', '').lower()
    if not channel:
        print('[Twitch] No channel set — chat commands disabled.')
        return

    while not is_shutting_down:
        try:
            print(f'[Twitch] Connecting to irc.chat.twitch.tv:6697...')
            raw = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            ctx = ssl.create_default_context()
            irc = ctx.wrap_socket(raw, server_hostname='irc.chat.twitch.tv')
            irc.connect(('irc.chat.twitch.tv', 6697))
            irc.settimeout(300)  # 5 min timeout for reads

            nick = f'justinfan{random.randint(10000, 99999)}'
            irc.sendall(f'NICK {nick}\r\n'.encode())
            irc.sendall(f'JOIN #{channel}\r\n'.encode())
            print(f'[Twitch] Connected as {nick}, joined #{channel}')

            buf = ''
            while not is_shutting_down:
                try:
                    data = irc.recv(4096).decode('utf-8', errors='replace')
                except socket.timeout:
                    # Send a ping to keep alive
                    try:
                        irc.sendall(b'PING :keepalive\r\n')
                    except Exception:
                        break
                    continue
                if not data:
                    break
                buf += data
                while '\r\n' in buf:
                    line, buf = buf.split('\r\n', 1)
                    if not line:
                        continue
                    if line.startswith('PING'):
                        irc.sendall(f'PONG {line[5:]}\r\n'.encode())
                        continue
                    m = PRIVMSG_RE.search(line)
                    if m:
                        user = m.group(1)
                        text = m.group(2).strip().lower()
                        print(f'[Twitch] {user}: {text}')
                        if text == '!quiz':
                            trigger_quiz()
                        elif text == '!quizt':
                            trigger_quiz(skip_cooldown=True)

            irc.close()
        except Exception as e:
            print(f'[Twitch] Error: {e}')
        if not is_shutting_down:
            print('[Twitch] Disconnected — reconnecting in 5s...')
            time.sleep(5)

# --- Timer thread (15-min interval) ---
def timer_thread():
    while not is_shutting_down:
        time.sleep(INTERVAL_SECONDS)
        if is_shutting_down:
            break
        print('[Timer] 15-minute interval — triggering quiz')
        trigger_quiz()

# --- System tray icon ---
def create_tray_icon():
    img = Image.new('RGB', (64, 64), color=(60, 40, 20))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype('msgothic.ttc', 40)
    except Exception:
        font = ImageFont.load_default()
    draw.text((12, 8), '漢', fill=(240, 230, 200), font=font)
    return img

tray_icon = None

def tray_trigger_quiz(_icon=None, _item=None):
    trigger_quiz(skip_cooldown=True)

def tray_quit(_icon=None, _item=None):
    global is_shutting_down
    if is_shutting_down:
        return
    is_shutting_down = True
    if tray_icon:
        tray_icon.stop()
    if quiz_window:
        try:
            quiz_window.destroy()
        except Exception:
            pass
    if server_proc and server_proc.poll() is None:
        server_proc.terminate()

def start_tray():
    global tray_icon
    menu = pystray.Menu(
        pystray.MenuItem('Trigger Quiz', tray_trigger_quiz),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem('Quit', tray_quit),
    )
    tray_icon = pystray.Icon('kanji-quiz', create_tray_icon(), 'Kanji Quiz Overlay', menu)
    tray_icon.run()

# --- Create quiz popup (hidden, pre-loaded) ---
quiz_window = webview.create_window(
    'Kanji Quiz',
    url=build_url('popup'),
    width=WIN_W,
    height=WIN_H,
    x=WIN_X,
    y=WIN_Y,
    frameless=True,
    on_top=False,
    hidden=True,
    js_api=api,
)

quiz_window.events.closing += lambda *_: tray_quit()

# --- Start everything ---
threading.Thread(target=start_tray, daemon=True).start()
threading.Thread(target=irc_thread, daemon=True).start()
threading.Thread(target=timer_thread, daemon=True).start()

webview.start(private_mode=False)
