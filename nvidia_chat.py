import requests
import base64
import os
import sys

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
stream = True

# Use environment variable or fallback to provided key
api_key = os.getenv("NVIDIA_API_KEY", "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")

headers = {
    "Authorization": f"Bearer {api_key}",
    "Accept": "text/event-stream" if stream else "application/json"
}

def read_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def send_message(user_message, conversation_history):
    """Send a message to the NVIDIA API and get a response"""
    conversation_history.append({"role": "user", "content": user_message})
    
    payload = {
        "model": "google/gemma-4-31b-it",
        "messages": conversation_history,
        "max_tokens": 16384,
        "temperature": 1.00,
        "top_p": 0.95,
        "stream": stream,
        "chat_template_kwargs": {"enable_thinking": True},
    }
    
    try:
        response = requests.post(invoke_url, headers=headers, json=payload, stream=stream)
        response.raise_for_status()
        
        full_response = ""
        if stream:
            print("\n🤖 Assistant: ", end="", flush=True)
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode("utf-8")
                    if decoded_line.startswith("data: "):
                        try:
                            import json
                            data = json.loads(decoded_line[6:])
                            if "choices" in data and len(data["choices"]) > 0:
                                delta = data["choices"][0].get("delta", {})
                                if "content" in delta:
                                    content = delta["content"]
                                    print(content, end="", flush=True)
                                    full_response += content
                        except:
                            pass
            print("\n")
        else:
            result = response.json()
            if "choices" in result and len(result["choices"]) > 0:
                full_response = result["choices"][0]["message"]["content"]
                print(f"\n🤖 Assistant: {full_response}\n")
        
        conversation_history.append({"role": "assistant", "content": full_response})
        return conversation_history
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        return conversation_history

def main():
    """Main chat loop"""
    print("=" * 60)
    print("🎬 NVIDIA Gemma 4 Chat Room")
    print("=" * 60)
    print("Welcome! Type 'quit' or 'exit' to end the conversation.")
    print("Type 'clear' to start a new conversation.")
    print("=" * 60 + "\n")
    
    conversation_history = []
    
    while True:
        try:
            user_input = input("👤 You: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit']:
                print("\n👋 Goodbye! Thanks for chatting.")
                break
            
            if user_input.lower() == 'clear':
                conversation_history = []
                print("🔄 Conversation cleared.\n")
                continue
            
            conversation_history = send_message(user_input, conversation_history)
            
        except KeyboardInterrupt:
            print("\n\n👋 Chat ended by user.")
            break
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            continue

if __name__ == "__main__":
    main()
