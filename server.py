import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Suppress noisy access logs for a clean console experience
        pass

def start_server():
    os.chdir(DIRECTORY)
    for p in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", p), Handler) as httpd:
                url = f"http://localhost:{p}"
                print("=" * 60)
                print(f"  🌙 Starlight Pomodoro - Anime Night Edition")
                print(f"  ✨ Đang chạy tại: {url}")
                print(f"  🪐 Đang mở trình duyệt...")
                print(f"  (Nhấn Ctrl+C để dừng máy chủ)")
                print("=" * 60)
                webbrowser.open(url)
                httpd.serve_forever()
        except OSError:
            continue

if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        print("\n🌙 Đã dừng Pomodoro Timer. Chúc bạn một buổi học tập hiệu quả!")
        sys.exit(0)
