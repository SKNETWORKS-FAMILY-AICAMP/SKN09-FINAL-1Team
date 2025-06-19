import ollama

class OllamaHosting:
    def __init__(self,model,prompt):
        self.model = model
        self.prompt = prompt
    
    def get_model_response(self):
        response = ollama.generate(model=self.model,prompt=self.prompt)
        return response.response