import os
import cv2
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

# -----------------------------
# Configuration
# -----------------------------
TRAIN_CSV = "/Volumes/Arun/how2sign_train.csv"
VAL_CSV   = "/Volumes/Arun/how2sign_val.csv"

TRAIN_DIR = "/Volumes/Arun/train_raw"           # Folder with training videos
VAL_DIR   = "/Volumes/Arun/validation_raw"      # Folder with validation videos

SAVED_MODEL_DIR = "saved_model"
os.makedirs(SAVED_MODEL_DIR, exist_ok=True)

NUM_EPOCHS = 10
BATCH_SIZE = 4
LEARNING_RATE = 1e-3
EMBED_SIZE = 256
HIDDEN_SIZE = 512
MAX_FRAMES = 32   # Maximum number of frames to sample per video segment
FPS = 24          # Use 24 FPS since you determined that's your video frame rate
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------
# Vocabulary and Tokenization
# -----------------------------
class Vocabulary:
    def __init__(self, freq_threshold=1):
        self.freq_threshold = freq_threshold
        self.word2idx = {"<PAD>": 0, "<SOS>": 1, "<EOS>": 2, "<UNK>": 3}
        self.idx2word = {0: "<PAD>", 1: "<SOS>", 2: "<EOS>", 3: "<UNK>"}
        self.word_freq = {}
    
    def build_vocabulary(self, sentence_list):
        idx = 4
        for sentence in sentence_list:
            for word in sentence.lower().split():
                self.word_freq[word] = self.word_freq.get(word, 0) + 1
        for word, freq in self.word_freq.items():
            if freq >= self.freq_threshold:
                self.word2idx[word] = idx
                self.idx2word[idx] = word
                idx += 1
    
    def numericalize(self, text):
        tokens = [self.word2idx.get(word, self.word2idx["<UNK>"]) for word in text.lower().split()]
        return tokens

# -----------------------------
# Dataset Definition
# -----------------------------
class How2SignDataset(Dataset):
    """
    Expects a CSV with columns: VIDEO_ID, VIDEO_NAME, SENTENCE_ID, SENTENCE_NAME, START, END, SENTENCE.
    START and END are in seconds.
    """
    def __init__(self, csv_path, video_dir, vocab, max_frames=32):
        # Read CSV as tab-delimited file
        self.df = pd.read_csv(csv_path, sep='\t', header=None, 
                              names=['VIDEO_ID', 'VIDEO_NAME', 'SENTENCE_ID', 'SENTENCE_NAME', 'START', 'END', 'SENTENCE'])
        self.video_dir = video_dir
        self.vocab = vocab
        self.max_frames = max_frames
        self.samples = []
        # Only keep rows where the video file exists
        for _, row in self.df.iterrows():
            video_file = os.path.join(video_dir, f"{row['VIDEO_NAME']}.mp4")
            if os.path.exists(video_file):
                self.samples.append(row)
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        row = self.samples[idx]
        video_file = os.path.join(self.video_dir, f"{row['VIDEO_NAME']}.mp4")
        start_seconds = float(row['START'])
        end_seconds   = float(row['END'])
        start_frame = int(start_seconds * FPS)
        end_frame   = int(end_seconds * FPS)
        
        frames = self._load_video_segment(video_file, start_frame, end_frame, self.max_frames)
        
        sentence = str(row['SENTENCE'])
        tokens = [self.vocab.word2idx["<SOS>"]]
        tokens += self.vocab.numericalize(sentence)
        tokens.append(self.vocab.word2idx["<EOS>"])
        caption_tensor = torch.tensor(tokens, dtype=torch.long)
        
        return frames, caption_tensor
    
    def _load_video_segment(self, video_file, start_frame, end_frame, max_frames):
        cap = cv2.VideoCapture(video_file)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        # Clamp frame indices to valid range
        if start_frame >= total_frames:
            start_frame = 0
        if end_frame > total_frames:
            end_frame = total_frames
        
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        frames_list = []
        current_frame = start_frame
        while current_frame < end_frame:
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.resize(frame, (224, 224))
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames_list.append(frame)
            current_frame += 1
            if len(frames_list) >= max_frames:
                break
        cap.release()
        if len(frames_list) == 0:
            frames_list.append(np.zeros((224, 224, 3), dtype=np.uint8))
        frames_arr = np.array(frames_list) / 255.0
        frames_tensor = torch.tensor(frames_arr).permute(0, 3, 1, 2).float()
        return frames_tensor

def collate_fn(batch):
    batch = [b for b in batch if b is not None]
    if len(batch) == 0:
        return None
    videos, captions = zip(*batch)
    max_t = max(v.shape[0] for v in videos)
    padded_videos = []
    for v in videos:
        t = v.shape[0]
        if t < max_t:
            pad = torch.zeros((max_t - t, 3, 224, 224), dtype=torch.float32)
            v = torch.cat([v, pad], dim=0)
        padded_videos.append(v.unsqueeze(0))
    videos_tensor = torch.cat(padded_videos, dim=0)  # (batch, T, 3, 224, 224)
    
    lengths = [len(c) for c in captions]
    max_len = max(lengths)
    padded_captions = torch.zeros((len(captions), max_len), dtype=torch.long)
    for i, c in enumerate(captions):
        padded_captions[i, :len(c)] = c
    return videos_tensor, padded_captions

# -----------------------------
# Model Definition
# -----------------------------
class CNNEncoder(nn.Module):
    def __init__(self, encoded_size=256):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, encoded_size, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
        )
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
    
    def forward(self, x):
        features = self.conv(x)
        features = self.pool(features)
        features = features.view(features.size(0), -1)
        return features

class VideoEncoder(nn.Module):
    def __init__(self, encoded_size=256, hidden_size=512):
        super().__init__()
        self.cnn = CNNEncoder(encoded_size)
        self.lstm = nn.LSTM(encoded_size, hidden_size, batch_first=True)
    
    def forward(self, videos):
        batch_size, T, C, H, W = videos.shape
        videos = videos.view(batch_size * T, C, H, W)
        frame_features = self.cnn(videos)  # (batch*T, encoded_size)
        frame_features = frame_features.view(batch_size, T, -1)
        _, (h, _) = self.lstm(frame_features)
        return h[-1]

class Decoder(nn.Module):
    def __init__(self, vocab_size, embed_size, hidden_size):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_size)
        self.lstm = nn.LSTM(embed_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, vocab_size)
    
    def forward(self, video_features, captions):
        embeddings = self.embed(captions)  # (batch, seq_len, embed_size)
        h0 = video_features.unsqueeze(0)    # (1, batch, hidden_size)
        c0 = torch.zeros_like(h0)
        outputs, _ = self.lstm(embeddings, (h0, c0))
        outputs = self.fc(outputs)
        return outputs

class ASLTranslator(nn.Module):
    def __init__(self, vocab_size, embed_size, hidden_size):
        super().__init__()
        self.encoder = VideoEncoder(encoded_size=256, hidden_size=hidden_size)
        self.decoder = Decoder(vocab_size, embed_size, hidden_size)
    
    def forward(self, videos, captions):
        video_features = self.encoder(videos)
        outputs = self.decoder(video_features, captions)
        return outputs

    def generate_caption(self, video, max_len, vocab):
        self.eval()
        with torch.no_grad():
            video_features = self.encoder(video)  # (1, hidden_size)
            input_token = torch.tensor([[vocab.word2idx["<SOS>"]]], device=DEVICE)  # shape (1,1)
            h = video_features.unsqueeze(0)  # (1, 1, hidden_size)
            c = torch.zeros_like(h)
            generated = []
            for _ in range(max_len):
                emb = self.decoder.embed(input_token)  # (1,1,embed_size)
                out, (h, c) = self.decoder.lstm(emb, (h, c))
                logits = self.decoder.fc(out.squeeze(1))  # (1, vocab_size)
                pred = logits.argmax(dim=1)  # (1,)
                token_id = pred.item()
                if token_id == vocab.word2idx["<EOS>"]:
                    break
                generated.append(token_id)
                # Update input_token: unsqueeze once to keep shape (1,1)
                input_token = pred.unsqueeze(0)
            return generated

# -----------------------------
# Training Routine
# -----------------------------
def main():
    # Build vocabulary from training sentences
    train_df = pd.read_csv(TRAIN_CSV, sep='\t', header=None, 
                           names=['VIDEO_ID', 'VIDEO_NAME', 'SENTENCE_ID', 'SENTENCE_NAME', 'START', 'END', 'SENTENCE'])
    sentences = train_df['SENTENCE'].astype(str).tolist()
    vocab = Vocabulary(freq_threshold=1)
    vocab.build_vocabulary(sentences)
    vocab_size = len(vocab.word2idx)
    print("Vocabulary size:", vocab_size)
    
    train_dataset = How2SignDataset(TRAIN_CSV, TRAIN_DIR, vocab, max_frames=MAX_FRAMES)
    val_dataset = How2SignDataset(VAL_CSV, VAL_DIR, vocab, max_frames=MAX_FRAMES)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, collate_fn=collate_fn)
    
    model = ASLTranslator(vocab_size, EMBED_SIZE, HIDDEN_SIZE).to(DEVICE)
    criterion = nn.CrossEntropyLoss(ignore_index=vocab.word2idx["<PAD>"])
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    best_val_loss = float('inf')
    for epoch in range(NUM_EPOCHS):
        model.train()
        total_loss = 0
        for batch in train_loader:
            if batch is None:
                continue
            videos, captions = batch
            videos = videos.to(DEVICE)
            captions = captions.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(videos, captions[:, :-1])
            loss = criterion(outputs.reshape(-1, vocab_size), captions[:, 1:].reshape(-1))
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        avg_train_loss = total_loss / len(train_loader)
        
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for batch in val_loader:
                if batch is None:
                    continue
                videos, captions = batch
                videos = videos.to(DEVICE)
                captions = captions.to(DEVICE)
                outputs = model(videos, captions[:, :-1])
                loss = criterion(outputs.reshape(-1, vocab_size), captions[:, 1:].reshape(-1))
                val_loss += loss.item()
        avg_val_loss = val_loss / len(val_loader)
        print(f"Epoch [{epoch+1}/{NUM_EPOCHS}] Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f}")
        
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), os.path.join(SAVED_MODEL_DIR, "best_model.pth"))
            print("  [*] Best model saved.")
    
    torch.save(model.state_dict(), os.path.join(SAVED_MODEL_DIR, "final_model.pth"))
    print("Training complete. Final model saved.")

if __name__ == "__main__":
    main()
