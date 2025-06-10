import pyttsx3  # Import pyttsx3 for text-to-speech conversion.
import speech_recognition as sr  # Import SpeechRecognition library to convert speech to text.

def text_to_speech(text):
    """
    Converts the given text to speech.
    
    Parameters:
        text (str): The text to be spoken.
    """
    engine = pyttsx3.init()  # Initialize the TTS engine.
    engine.say(text)         # Queue the text to be spoken.
    engine.runAndWait()      # Process the queued command and speak the text.

def speech_to_text():
    """
    Captures audio from the microphone and converts it to text using Google's speech recognition API.
    
    Returns:
        str: The recognized text or an error message if recognition fails.
    """
    recognizer = sr.Recognizer()  # Create an instance of the Recognizer class.
    with sr.Microphone() as source:  # Use the default system microphone as the audio source.
        print("Speak now...")          # Prompt the user to speak.
        audio = recognizer.listen(source)  # Listen for the first phrase and record the audio.
    
    try:
        # Use Google's speech recognition to convert audio to text.
        return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        # Handle the case when speech is unintelligible.
        return "Audio not recognized."
    except sr.RequestError as e:
        # Handle errors related to the API request (e.g., no internet connection).
        return f"Request failed: {e}"

if __name__ == '__main__':
    # Define sample text to be converted to speech.
    sample_text = "Hello, this is an example of text to speech conversion."
    print("Converting text to speech...")
    text_to_speech(sample_text)  # Call the function to convert text to spoken output.
    
    print("\nConverting your speech to text...")
    result = speech_to_text()  # Capture speech from the microphone and convert it to text.
    print("You said:", result)  # Print the recognized text or error message.
