import pyttsx3
import speech_recognition as sr

def text_to_speech(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()

def speech_to_text():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Speak now...")
        audio = recognizer.listen(source)
    try:
        return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        return "Audio not recognized."
    except sr.RequestError as e:
        return f"Request failed: {e}"

if __name__ == '__main__':
    sample_text = "Hello, this is an example of text to speech conversion."
    print("Converting text to speech...")
    text_to_speech(sample_text)
    
    print("\nConverting your speech to text...")
    result = speech_to_text()
    print("You said:", result)
