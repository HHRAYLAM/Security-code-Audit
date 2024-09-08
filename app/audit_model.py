import os
from dotenv import load_dotenv
import openai
import json

# 加载 .env 文件
load_dotenv(override=True)

# 获取 API_TOKEN
API_TOKEN = os.getenv('OPENAI_API_KEY')

# 初始化 OpenAI 客户端
client = openai.OpenAI(
    api_key=API_TOKEN,
    base_url="https://api.deepseek.com",
)

def query(messages, model="deepseek-coder"):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        response_format={
            'type': 'json_object'
        }
    )
    return response.choices[0].message.content

def normalize_suggestions(suggestions):
    normalized = []
    for suggestion in suggestions:
        issue = suggestion.get('issue', 'No issue provided')
        description = suggestion.get('description')
        solution = suggestion.get('solution') or suggestion.get('suggestion', 'No solution provided')
        
        if not description:
            description = solution
            solution = None
        
        normalized.append({
            'issue': issue,
            'description': description,
            'solution': solution
        })
    return normalized

def audit_code(file_content_str):
    # 调试输出文件内容
    print("File content to be audited:", file_content_str)
    # 调用 DeepSeek 模型进行代码审核
    system_prompt = """
    You are a helpful coder assistant.
    The user will provide a piece of code. Please review the code and provide suggestions for improvements in JSON format.
    Each suggestion should include the following fields:
    - issue: A brief description of the issue.
    - description: A detailed description of the issue.
    - solution: A suggested solution to the issue.
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": file_content_str}
    ]
    audit_result = query(messages)
    audit_result_json = json.loads(audit_result)
    audit_result_json['suggestions'] = normalize_suggestions(audit_result_json.get('suggestions', []))
    return audit_result_json

# # 测试函数
# if __name__ == "__main__":
#     test_content = """
#         <!DOCTYPE html>
#     <html lang="en">
#     <head>
#         <meta charset="UTF-8" />
#         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
#         <title>Code Audit</title>
#     </head>
#     <body>
#         <h1>Code Audit Service</h1>
#         <p>
#         Contract Address:
#         <span id="contract-address">{{ contract_address }}</span>
#         </p>
#         <button id="connect-button">Connect Wallet</button>
#         <br /><br />
#         <input type="file" id="file-input" />
#         <br /><br />
#         <button id="upload-button">Upload and Audit</button>
#     </body>
#     <script src="https://cdn.jsdelivr.net/npm/web3@1.3.6/dist/web3.min.js"></script>
#     <script src="{{ url_for('static', filename='main.js') }}"></script>
#     </html>

#     """
#     result = audit_code(test_content)
#     print(result)
