# test_from_csv.py

import os
import cv2
import numpy as np
import pandas as pd
import torch
import argparse

from train_live import Vocabulary, MultiViewASLTranslator, MAX_FRAMES, EMBED_SIZE, HIDDEN_SIZE, DEVICE

# -----------------------------
# Configuration
# -----------------------------
TRAIN_CSV       = "/volumes/arun/how2sign_train.csv"
TEST_CSV        = "/volumes/arun/how2sign_test.csv"
FRONT_DIR       = "/volumes/arun/front/test/raw_videos"
SIDE_DIR        = "/volumes/arun/side/test/raw_videos"
SAVED_MODEL_DIR = "/volumes/arun/model/trained_model"
FPS             = 24   # must match training

# -----------------------------
# Helpers
# -----------------------------
def load_video_segment(video_file, start_s, end_s, max_frames=MAX_FRAMES):
    """Load up to max_frames between start_s and end_s (seconds)."""
    cap     = cv2.VideoCapture(video_file)
    total   = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    start_f = min(int(start_s * FPS), total - 1)
    end_f   = min(int(end_s   * FPS), total)
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_f)
    frames = []
    f = start_f
    while f < end_f and len(frames) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.resize(frame, (224,224))
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frames.append(frame)
        f += 1
    cap.release()
    if not frames:
        frames = [np.zeros((224,224,3), np.uint8)]
    arr    = np.array(frames) / 255.0
    tensor = torch.tensor(arr).permute(0,3,1,2).float()
    return tensor

def load_vocab(train_csv):
    """Build vocabulary from the training TSV."""
    df = pd.read_csv(train_csv, sep='\t', header=None,
                     names=['VIDEO_ID','VIDEO_NAME','SENTENCE_ID',
                            'SENTENCE_NAME','START','END','SENTENCE'])
    vocab = Vocabulary(freq_threshold=1)
    vocab.build_vocabulary(df['SENTENCE'].astype(str).tolist())
    return vocab

def predict_from_csv(model, vocab, sent_name):
    """Look up start/end in TEST_CSV and generate the predicted sentence."""
    # read test TSV
    df = pd.read_csv(TEST_CSV, sep='\t', header=None,
                     names=['VIDEO_ID','VIDEO_NAME','SENTENCE_ID',
                            'SENTENCE_NAME','START','END','SENTENCE'])
    row = df[df['SENTENCE_NAME'] == sent_name]
    if row.empty:
        print(f"Error: '{sent_name}' not found in {TEST_CSV}")
        print("Available SENTENCE_NAMEs:", df['SENTENCE_NAME'].unique()[:10])
        return None
    row = row.iloc[0]

    start_s = float(row['START'])
    end_s   = float(row['END'])
    front_file = os.path.join(FRONT_DIR, sent_name + ".mp4")
    side_file  = os.path.join(SIDE_DIR, sent_name.replace("_front","_side") + ".mp4")
    if not os.path.exists(front_file) or not os.path.exists(side_file):
        print("Error: video files not found for", sent_name)
        return None

    f_t = load_video_segment(front_file, start_s, end_s).unsqueeze(0).to(DEVICE)
    s_t = load_video_segment(side_file,  start_s, end_s).unsqueeze(0).to(DEVICE)

    token_ids = model.generate_caption(f_t, s_t, max_len=50, vocab=vocab, device=DEVICE)
    words = [vocab.idx2word.get(i, "<UNK>") for i in token_ids]
    return " ".join(words), row['SENTENCE']

# -----------------------------
# Main
# -----------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Generate ASL translation for a test clip using timestamps from the CSV"
    )
    parser.add_argument(
        "--video", required=True,
        help="The SENTENCE_NAME (filename without .mp4) to test"
    )
    args = parser.parse_args()

    # build vocab
    vocab = load_vocab(TRAIN_CSV)

    # load model
    model = MultiViewASLTranslator(len(vocab.word2idx), EMBED_SIZE, HIDDEN_SIZE).to(DEVICE)
    ckpt = os.path.join(SAVED_MODEL_DIR, "final_model.pth")
    state = torch.load(ckpt, map_location=DEVICE)
    model.load_state_dict(state)
    model.eval()

    result = predict_from_csv(model, vocab, args.video)
    if result is None:
        return

    predicted, actual = result
    print("\n=== Results ===")
    print(f"VIDEO        : {args.video}")
    print(f"Predicted    : {predicted}")
    print(f"Ground truth : {actual}")
    print("================\n")

if __name__ == "__main__":
    main()
