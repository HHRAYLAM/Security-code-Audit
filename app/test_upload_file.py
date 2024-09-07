from io import BytesIO
from app.upload_file import handle_file_upload

# 模拟一个文件上传
class MockFile:
    def __init__(self, filename, content):
        self.filename = filename
        self.file = BytesIO(content.encode('utf-8'))
    
    def read(self):
        return self.file.read()

# 创建一个模拟文件对象
mock_file = MockFile('test_file.txt', 
                     '''def create_app():
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

                        return app
                        ''')

# 调用 handle_file_upload 函数
file_content, error = handle_file_upload(mock_file)

if error:
    print(f"Error: {error}")
else:
    print(f"File content received:\n{file_content}")