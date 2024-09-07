def handle_file_upload(file):
    if file.filename == '':
        return None, "No selected file"

    try:
        # 直接读取文件内容为二进制数据
        file_content = file.read()
        # 尝试将文件内容解码为UTF-8字符串
        file_content_str = file_content.decode('utf-8', errors='ignore')
        
        return file_content_str, None
    except Exception as e:
        return None, f"Failed to read file content: {str(e)}"

def validate_file(file):
    allowed_extensions = {'py', 'js', 'java', 'cpp', 'c', 'cs', 'rb', 'go', 'rs', 'php', 'html', 'css'}
    if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
        return False, 'File type not allowed'
    return True, None
