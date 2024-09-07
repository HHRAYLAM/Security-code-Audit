from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
import logging
from app.audit_model import audit_code
from app.upload_file import handle_file_upload, validate_file
import json
import os
from dotenv import load_dotenv


# 加载 .env 文件
load_dotenv(override=True)

main = Blueprint('main', __name__)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@main.route('/')
def index():
    contract_address = os.getenv('Sepolia_CONTRACT_ADDRESS')
    return render_template('index.html', contract_address=contract_address)

@main.route('/upload', methods=['POST'])
def upload_file():
    user_wallet_address = request.form.get('wallet_address')
    logger.info(f"Received upload request from: {user_wallet_address}")

    try:
        if 'file' not in request.files:
            flash('No file part')
            return redirect(url_for('main.index'))

        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(url_for('main.index'))

        # 验证文件类型
        is_valid, error = validate_file(file)
        if not is_valid:
            flash(error)
            return redirect(url_for('main.index'))

        # 处理文件上传
        file_content_str, error = handle_file_upload(file)
        if error:
            flash(error)
            return redirect(url_for('main.index'))

        # 调用大模型进行代码审核
        audit_result = audit_code(file_content_str)
        
        if isinstance(audit_result, dict) and "error" not in audit_result:
            logger.debug("Successfully used the LLM")
            audit_result_str = json.dumps(audit_result)
            return redirect(url_for('main.success', audit_result=audit_result_str))
        else:
            logger.error(f"Audit error: {audit_result}")
            flash('An error occurred during the audit process. Please try again.')
            return redirect(url_for('main.index'))

    except Exception as e:
        logger.error(f"Error in upload_file: {str(e)}")
        flash('An error occurred during the upload process. Please try again.')
        return redirect(url_for('main.index'))

@main.route('/success')
def success():
    audit_result_str = request.args.get('audit_result', '')
    try:
        audit_result = json.loads(audit_result_str)
        suggestions = audit_result.get('suggestions', [])
        return render_template('success.html', suggestions=suggestions)
    except json.JSONDecodeError:
        flash('Error processing audit result')
        return redirect(url_for('main.index'))