from flask import Flask
from app.views import main as main_blueprint
from config import Config
import database
# from flask_socketio import SocketIO

# socketio = SocketIO()

def create_app():
    app = Flask(__name__, static_folder='static')

    # 加载配置
    app.config.from_object(Config)

    # 注册蓝图
    app.register_blueprint(main_blueprint)

    # 禁用模板缓存
    app.config['TEMPLATES_AUTO_RELOAD'] = True

    # 初始化数据库
    with app.app_context():
        database.init_db()  # 调用 init_db 函数
    
    # socketio.init_app(app)


    return app