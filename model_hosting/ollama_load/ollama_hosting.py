import ollama

class OllamaHosting:
    def __init__(self,model,prompt):
        self.model = model
        self.prompt = prompt
    
    def get_model_response(self):
        response = ollama.generate(model=self.model,prompt=self.prompt)
        return response.response
    
# ollama 호스팅 테스트
# ollama_hosting = OllamaHosting('qwen2.5','안녕하세요')
# response = ollama_hosting.get_model_response()
# print(response)
    
# response = ollama.generate(model='qwen2.5',prompt='안녕하세요')
# print(response)