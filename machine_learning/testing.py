import argparse
import numpy as np
import tensorflow as tf
from PIL import Image
from geopy.geocoders import Nominatim
import matplotlib.pyplot as plt
import os
import sys
from datetime import datetime
import json

img_size = (224, 224)
class_names = ['accident', 'non_accident'] 
FINAL_MODEL_PATH = 'accident_detection_model.h5'
BEST_MODEL_PATH = 'best_model.h5'
RESULTS_LOG_PATH = 'prediction_results.json'

class AccidentDetector:
    def __init__(self):
        self.model_final = None
        self.model_best = None
        self.results_history = []
        self.load_models()
        self.load_results_history()
    
    def load_models(self):
        """Load both trained models"""
        try:
            print("Loading models...")
            self.model_final = tf.keras.models.load_model(FINAL_MODEL_PATH)
            self.model_best = tf.keras.models.load_model(BEST_MODEL_PATH)
            print("Both models loaded successfully!")
        except Exception as e:
            print(f"Error loading models: {e}")
            sys.exit(1)
    
    def load_results_history(self):
        """Load previous prediction results"""
        try:
            if os.path.exists(RESULTS_LOG_PATH):
                with open(RESULTS_LOG_PATH, 'r') as f:
                    self.results_history = json.load(f)
        except Exception as e:
            print(f"Could not load results history: {e}")
            self.results_history = []
    
    def save_results_history(self):
        """Save prediction results to file"""
        try:
            with open(RESULTS_LOG_PATH, 'w') as f:
                json.dump(self.results_history, f, indent=2)
        except Exception as e:
            print(f"Could not save results history: {e}")
    
    def preprocess_image(self, image_path):
        """Preprocess image for model prediction"""
        try:
            img = Image.open(image_path).resize(img_size)
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            return img_array, img
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return None, None
    
    def predict_accident(self, image_path, model, model_name):
        """Predict accident from image using specified model"""
        img_array, original_img = self.preprocess_image(image_path)
        if img_array is None:
            return None, None, None, None
        
        prediction = model.predict(img_array, verbose=0)[0][0]
        class_idx = 0 if prediction < 0.5 else 1
        confidence = (1 - prediction) if class_idx == 0 else prediction
        is_accident = (class_idx == 0)
        
        return class_names[class_idx], confidence, is_accident, original_img
    
    def get_location(self):
        """Get current location (placeholder implementation)"""
        try:
            geolocator = Nominatim(user_agent="accident_detector")
            # For demo purposes, using a default location
            location = geolocator.geocode("New York, NY, USA")
            return location.address if location else "Unknown location"
        except:
            return "Location unavailable"
    
    def display_prediction_results(self, image_path):
        """Display prediction results with visualization"""
        print("\n" + "="*60)
        print("ANALYZING IMAGE...")
        print("="*60)
        
        pred_final, conf_final, is_acc_final, img = self.predict_accident(
            image_path, self.model_final, "Final Model"
        )
        pred_best, conf_best, is_acc_best, _ = self.predict_accident(
            image_path, self.model_best, "Best Model"
        )
        
        if pred_final is None:
            return
        
        print(f"PREDICTION RESULTS:")
        print(f"Final Model: {pred_final} (Confidence: {conf_final:.2%})")
        print(f"Best Model:  {pred_best} (Confidence: {conf_best:.2%})")
        
        if is_acc_final or is_acc_best:
            print("\nACCIDENT DETECTED!")
            location = self.get_location()
            print(f"Location: {location}")
            print("Alert system would be triggered!")
        else:
            print("\nNo accident detected")
        
        result_entry = {
            "timestamp": datetime.now().isoformat(),
            "image_path": image_path,
            "final_model": {"prediction": pred_final, "confidence": float(conf_final)},
            "best_model": {"prediction": pred_best, "confidence": float(conf_best)},
            "accident_detected": is_acc_final or is_acc_best
        }
        self.results_history.append(result_entry)
        self.save_results_history()
        
        self.visualize_prediction(img, pred_final, conf_final, pred_best, conf_best, image_path)
    
    def visualize_prediction(self, img, pred_final, conf_final, pred_best, conf_best, image_path):
        """Create visualization of prediction results"""
        plt.figure(figsize=(12, 8))
        
        plt.subplot(2, 2, (1, 3))
        plt.imshow(img)
        plt.title(f"Input Image\n{os.path.basename(image_path)}", fontsize=14, fontweight='bold')
        plt.axis('off')
        
        plt.subplot(2, 2, 2)
        colors = ['red' if pred_final == 'accident' else 'green']
        plt.bar(['Final Model'], [conf_final], color=colors, alpha=0.7)
        plt.title(f'Final Model\n{pred_final}', fontweight='bold')
        plt.ylabel('Confidence')
        plt.ylim(0, 1)
        plt.text(0, conf_final + 0.05, f'{conf_final:.2%}', ha='center', fontweight='bold')
        
        plt.subplot(2, 2, 4)
        colors = ['red' if pred_best == 'accident' else 'green']
        plt.bar(['Best Model'], [conf_best], color=colors, alpha=0.7)
        plt.title(f'Best Model\n{pred_best}', fontweight='bold')
        plt.ylabel('Confidence')
        plt.ylim(0, 1)
        plt.text(0, conf_best + 0.05, f'{conf_best:.2%}', ha='center', fontweight='bold')
        
        plt.tight_layout()
        plt.show()
    
    def show_model_summary(self):
        """Display model architecture and summary"""
        print("\n" + "="*60)
        print("MODEL ARCHITECTURE")
        print("="*60)
        
        print("\nFINAL MODEL SUMMARY:")
        print("-" * 40)
        self.model_final.summary()
        
        print(f"\nBEST MODEL SUMMARY:")
        print("-" * 40)
        self.model_best.summary()
        
        # Plot model architecture if possible
        try:
            plt.figure(figsize=(15, 10))
            
            plt.subplot(1, 2, 1)
            tf.keras.utils.plot_model(self.model_final, show_shapes=True, show_layer_names=True)
            plt.title("Final Model Architecture")
            
            plt.subplot(1, 2, 2)
            tf.keras.utils.plot_model(self.model_best, show_shapes=True, show_layer_names=True)
            plt.title("Best Model Architecture")
            
            plt.tight_layout()
            plt.show()
        except Exception as e:
            print(f"Could not plot model architecture: {e}")
    
    def show_results_history(self):
        """Display prediction history"""
        if not self.results_history:
            print("\nNo prediction history available yet.")
            return
        
        print("\n" + "="*60)
        print("PREDICTION HISTORY")
        print("="*60)
        
        accident_count = sum(1 for result in self.results_history if result['accident_detected'])
        total_count = len(self.results_history)
        
        print(f"Total predictions: {total_count}")
        print(f"Accidents detected: {accident_count}")
        print(f"Safe images: {total_count - accident_count}")
        
        print("\nRecent predictions:")
        for i, result in enumerate(self.results_history[-10:], 1):  # Show last 10
            status = "ACCIDENT" if result['accident_detected'] else "✅ SAFE"
            timestamp = datetime.fromisoformat(result['timestamp']).strftime("%Y-%m-%d %H:%M")
            image_name = os.path.basename(result['image_path'])
            print(f"{i:2d}. {timestamp} | {image_name} | {status}")
    
    def batch_predict(self, directory_path):
        """Predict on multiple images in a directory"""
        if not os.path.exists(directory_path):
            print(f"Directory not found: {directory_path}")
            return
        
        image_extensions = ('.png', '.jpg', '.jpeg', '.bmp', '.gif')
        image_files = [f for f in os.listdir(directory_path) 
                      if f.lower().endswith(image_extensions)]
        
        if not image_files:
            print(f"No image files found in {directory_path}")
            return
        
        print(f"\nProcessing {len(image_files)} images...")
        print("="*60)
        
        results = []
        for i, filename in enumerate(image_files, 1):
            image_path = os.path.join(directory_path, filename)
            print(f"\n[{i}/{len(image_files)}] Processing: {filename}")
            
            pred_final, conf_final, is_acc_final, _ = self.predict_accident(
                image_path, self.model_final, "Final"
            )
            pred_best, conf_best, is_acc_best, _ = self.predict_accident(
                image_path, self.model_best, "Best"
            )
            
            if pred_final is not None:
                accident_detected = is_acc_final or is_acc_best
                status = "ACCIDENT" if accident_detected else "SAFE"
                
                print(f"   Final Model: {pred_final} ({conf_final:.2%})")
                print(f"   Best Model:  {pred_best} ({conf_best:.2%})")
                print(f"   Result: {status}")
                
                results.append({
                    'filename': filename,
                    'final_pred': pred_final,
                    'final_conf': conf_final,
                    'best_pred': pred_best,
                    'best_conf': conf_best,
                    'accident_detected': accident_detected
                })
        
        # Summary
        accident_count = sum(1 for r in results if r['accident_detected'])
        print(f"\nBATCH PROCESSING SUMMARY:")
        print(f"   Total images: {len(results)}")
        print(f"   Accidents detected: {accident_count}")
        print(f"   Safe images: {len(results) - accident_count}")

def display_menu():
    """Display the main menu"""
    print("\n" + "="*60)
    print("ACCIDENT DETECTION SYSTEM")
    print("="*60)
    print("1.Test single image")
    print("2.Batch test directory")
    print("3.Show model architecture")
    print("4.Show prediction history")
    print("5.Clear prediction history")
    print("6.Exit")
    print("="*60)

def get_user_choice():
    """Get user menu choice with validation"""
    while True:
        try:
            choice = input("\nEnter your choice (1-6): ").strip()
            if choice in ['1', '2', '3', '4', '5', '6']:
                return int(choice)
            else:
                print("Invalid choice. Please enter a number between 1-6.")
        except KeyboardInterrupt:
            print("\nTerminating the program...")
            sys.exit(0)

def main():
    """Main interactive loop"""
    print("Initializing Accident Detection System...")
    detector = AccidentDetector()
    
    while True:
        try:
            display_menu()
            choice = get_user_choice()
            
            if choice == 1:
                image_path = input("\nEnter image path: ").strip().strip('"\'')
                if os.path.exists(image_path):
                    detector.display_prediction_results(image_path)
                else:
                    print(f"Image not found: {image_path}")
            
            elif choice == 2:
                dir_path = input("\nEnter directory path: ").strip().strip('"\'')
                detector.batch_predict(dir_path)
            
            elif choice == 3:
                detector.show_model_summary()
            
            elif choice == 4:
                detector.show_results_history()
            
            elif choice == 5:
                confirm = input("\nAre you sure you want to clear history? (y/N): ")
                if confirm.lower() in ['y', 'yes']:
                    detector.results_history = []
                    detector.save_results_history()
                    print("History cleared!")
                else:
                    print("Operation cancelled.")
            
            elif choice == 6:
                print("\nThank you for using SMART ACCIDENT DETETCTOR!")
                break
            
            input("\nPress Enter to continue...")
            
        except KeyboardInterrupt:
            print("\nTerminating...")
            break
        except Exception as e:
            print(f"An error occurred: {e}")
            input("\nPress Enter to continue...")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Interactive Accident Detection System")
    parser.add_argument('--image_path', type=str, help="Path to a single image (bypasses interactive mode)")
    parser.add_argument('--dir_path', type=str, help="Path to directory (bypasses interactive mode)")
    parser.add_argument('--interactive', action='store_true', default=True, 
                       help="Run in interactive mode (default)")
    
    args = parser.parse_args()
    
    if args.image_path or args.dir_path:
        detector = AccidentDetector()
        if args.image_path:
            detector.display_prediction_results(args.image_path)
        elif args.dir_path:
            detector.batch_predict(args.dir_path)
    else:
        main()