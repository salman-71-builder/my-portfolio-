#!/usr/bin/env python3
"""
Facebook Lite ADB Automation Script
Devices: emulator-5554 (Device A), emulator-5556 (Device B)
Package: com.facebook.lite4
"""

import subprocess
import time
import logging
import sys
import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime

import cv2
import numpy as np

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logging.warning("pytesseract not available; falling back to uiautomator for text detection.")

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DEVICE_A = "emulator-5554"
DEVICE_B = "emulator-5556"
PACKAGE = "com.facebook.lite4"
IMAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "image")
TEMPLATE_THRESHOLD = 0.8


# ---------------------------------------------------------------------------
# DeviceController
# ---------------------------------------------------------------------------
class DeviceController:
    """Wraps ADB interactions for a single device."""

    def __init__(self, serial: str):
        self.serial = serial

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _adb(self, *args, timeout: int = 30) -> subprocess.CompletedProcess:
        cmd = ["adb", "-s", self.serial] + list(args)
        logger.debug("ADB cmd: %s", " ".join(cmd))
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
        )
        return result

    def _adb_output(self, *args, timeout: int = 30) -> str:
        result = self._adb(*args, timeout=timeout)
        return result.stdout.decode("utf-8", errors="replace")

    # ------------------------------------------------------------------
    # Screenshot
    # ------------------------------------------------------------------
    def screenshot(self) -> np.ndarray:
        """Capture a screenshot and return as a BGR numpy array."""
        result = subprocess.run(
            ["adb", "-s", self.serial, "exec-out", "screencap", "-p"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
        )
        if result.returncode != 0 or not result.stdout:
            raise RuntimeError(f"screencap failed on {self.serial}: {result.stderr.decode()}")
        arr = np.frombuffer(result.stdout, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise RuntimeError("Failed to decode screenshot PNG data.")
        return img

    # ------------------------------------------------------------------
    # Template matching
    # ------------------------------------------------------------------
    def find_image(self, img_path: str):
        """
        Search for a template image on the current screen.
        Returns (cx, cy) center coordinates if found, else None.
        img_path can be a filename (looked up in IMAGE_DIR) or an absolute path.
        """
        if not os.path.isabs(img_path):
            img_path = os.path.join(IMAGE_DIR, img_path)

        template = cv2.imread(img_path, cv2.IMREAD_COLOR)
        if template is None:
            logger.warning("Template image not found on disk: %s", img_path)
            return None

        screen = self.screenshot()
        result = cv2.matchTemplate(screen, template, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, max_loc = cv2.minMaxLoc(result)

        if max_val >= TEMPLATE_THRESHOLD:
            h, w = template.shape[:2]
            cx = max_loc[0] + w // 2
            cy = max_loc[1] + h // 2
            logger.info("[%s] Found %s at (%d, %d) conf=%.3f",
                        self.serial, os.path.basename(img_path), cx, cy, max_val)
            return (cx, cy)

        return None

    def wait_for_image(self, img_path: str, timeout: float = 20, interval: float = 2):
        """
        Poll until the image is found or timeout expires.
        Returns (cx, cy) or None on timeout.
        """
        deadline = time.time() + timeout
        while time.time() < deadline:
            coords = self.find_image(img_path)
            if coords:
                return coords
            time.sleep(interval)
        logger.warning("[%s] Timeout waiting for %s", self.serial, img_path)
        return None

    # ------------------------------------------------------------------
    # Tap
    # ------------------------------------------------------------------
    def tap(self, x: int, y: int):
        logger.info("[%s] Tap (%d, %d)", self.serial, x, y)
        self._adb("shell", "input", "tap", str(x), str(y))

    def tap_image(self, img_path: str) -> bool:
        """Find image and tap its center. Returns True on success."""
        coords = self.find_image(img_path)
        if coords:
            self.tap(*coords)
            return True
        return False

    # ------------------------------------------------------------------
    # Text detection
    # ------------------------------------------------------------------
    def get_text_on_screen(self) -> str:
        """
        Return all visible text on the screen.
        Primary: uiautomator dump -> parse XML.
        Fallback: pytesseract OCR on screenshot.
        """
        try:
            # Dump UI hierarchy to device temp file then pull
            self._adb("shell", "uiautomator", "dump", "/sdcard/ui_dump.xml", timeout=15)
            xml_bytes = subprocess.run(
                ["adb", "-s", self.serial, "exec-out", "cat", "/sdcard/ui_dump.xml"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=15,
            ).stdout
            xml_str = xml_bytes.decode("utf-8", errors="replace")
            if xml_str.strip():
                root = ET.fromstring(xml_str)
                texts = []
                for node in root.iter():
                    t = node.get("text", "")
                    if t:
                        texts.append(t)
                combined = " ".join(texts)
                logger.debug("[%s] UI text (len=%d)", self.serial, len(combined))
                return combined
        except Exception as exc:
            logger.debug("[%s] uiautomator failed: %s", self.serial, exc)

        # Fallback to OCR
        if TESSERACT_AVAILABLE:
            try:
                img = self.screenshot()
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                text = pytesseract.image_to_string(gray)
                logger.debug("[%s] OCR text (len=%d)", self.serial, len(text))
                return text
            except Exception as exc:
                logger.debug("[%s] OCR failed: %s", self.serial, exc)

        return ""

    def text_visible(self, search_text: str) -> bool:
        """Case-insensitive substring check in on-screen text."""
        screen_text = self.get_text_on_screen()
        return search_text.lower() in screen_text.lower()

    # ------------------------------------------------------------------
    # Clipboard
    # ------------------------------------------------------------------
    def get_clipboard(self) -> str:
        """
        Retrieve clipboard content from the device.
        Tries clipper broadcast first, then service call fallback.
        """
        # Method 1: clipper app broadcast
        try:
            out = self._adb_output(
                "shell", "am", "broadcast", "-a", "clipper.get", timeout=10
            )
            # clipper prints: result=0, data="<content>"
            match = re.search(r'data="([^"]*)"', out)
            if match:
                content = match.group(1)
                if content:
                    logger.info("[%s] Clipboard via clipper: %r", self.serial, content[:80])
                    return content
        except Exception as exc:
            logger.debug("[%s] clipper broadcast failed: %s", self.serial, exc)

        # Method 2: service call clipboard (Android 9 and below)
        try:
            out = self._adb_output(
                "shell", "service", "call", "clipboard", "2", timeout=10
            )
            # Parse Parcel output - text is inside single quotes
            match = re.search(r"'([^']+)'", out)
            if match:
                content = match.group(1)
                logger.info("[%s] Clipboard via service call: %r", self.serial, content[:80])
                return content
        except Exception as exc:
            logger.debug("[%s] service call clipboard failed: %s", self.serial, exc)

        # Method 3: content provider (some ROMs)
        try:
            out = self._adb_output(
                "shell", "content", "query", "--uri", "content://clipboard/", timeout=10
            )
            match = re.search(r"text=([^\n,]+)", out)
            if match:
                content = match.group(1).strip()
                if content:
                    logger.info("[%s] Clipboard via content provider: %r", self.serial, content[:80])
                    return content
        except Exception as exc:
            logger.debug("[%s] content provider clipboard failed: %s", self.serial, exc)

        logger.warning("[%s] Could not retrieve clipboard content.", self.serial)
        return ""

    # ------------------------------------------------------------------
    # Text input / paste
    # ------------------------------------------------------------------
    def paste_text(self, text: str):
        """
        Input text via ADB.  Escapes characters that the shell would
        interpret so the number reaches the app intact.
        """
        escaped = (
            text
            .replace("\\", "\\\\")
            .replace('"', '\\"')
            .replace("'", "\\'")
            .replace(" ", "%s")
            .replace("&", "\\&")
            .replace("|", "\\|")
            .replace(";", "\\;")
            .replace("(", "\\(")
            .replace(")", "\\)")
            .replace("<", "\\<")
            .replace(">", "\\>")
            .replace("`", "\\`")
        )
        logger.info("[%s] Paste text: %r", self.serial, text)
        self._adb("shell", "input", "text", escaped)

    # ------------------------------------------------------------------
    # Scroll
    # ------------------------------------------------------------------
    def scroll_down(self):
        logger.info("[%s] Scroll down", self.serial)
        self._adb("shell", "input", "swipe", "540", "1200", "540", "600", "500")

    # ------------------------------------------------------------------
    # App management
    # ------------------------------------------------------------------
    def clear_app_data(self, package: str):
        logger.info("[%s] Clearing app data for %s", self.serial, package)
        self._adb("shell", "pm", "clear", package)

    def launch_app(self, package: str):
        logger.info("[%s] Launching %s", self.serial, package)
        self._adb(
            "shell", "monkey", "-p", package,
            "-c", "android.intent.category.LAUNCHER", "1"
        )

    def press_back(self):
        self._adb("shell", "input", "keyevent", "KEYCODE_BACK")

    # ------------------------------------------------------------------
    # OCR countdown helper
    # ------------------------------------------------------------------
    def find_countdown_near_sms(self) -> int:
        """
        Look for a number near the word 'SMS' on screen.
        Returns the integer countdown value, or -1 if not found.
        """
        if not TESSERACT_AVAILABLE:
            # Try to parse from uiautomator text
            text = self.get_text_on_screen()
            sms_idx = text.lower().find("sms")
            if sms_idx == -1:
                return -1
            snippet = text[max(0, sms_idx - 50): sms_idx + 50]
            numbers = re.findall(r"\b(\d{1,3})\b", snippet)
            if numbers:
                return int(numbers[0])
            return -1

        try:
            img = self.screenshot()
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
            texts = data["text"]
            lefts = data["left"]
            tops = data["top"]

            # Find SMS text position
            sms_positions = [
                i for i, t in enumerate(texts)
                if "sms" in t.lower() and t.strip()
            ]
            if not sms_positions:
                return -1

            sms_idx = sms_positions[0]
            sms_x = lefts[sms_idx]
            sms_y = tops[sms_idx]

            # Find numbers within 200px radius of SMS
            for i, t in enumerate(texts):
                if not t.strip():
                    continue
                m = re.match(r"^(\d{1,3})$", t.strip())
                if m:
                    dist_x = abs(lefts[i] - sms_x)
                    dist_y = abs(tops[i] - sms_y)
                    if dist_x < 200 and dist_y < 100:
                        return int(m.group(1))
        except Exception as exc:
            logger.debug("[%s] countdown OCR failed: %s", self.serial, exc)

        return -1


# ---------------------------------------------------------------------------
# FacebookAutomation
# ---------------------------------------------------------------------------
class FacebookAutomation:
    """Orchestrates the full automation flow across Device A and Device B."""

    def __init__(self):
        self.device_a = DeviceController(DEVICE_A)
        self.device_b = DeviceController(DEVICE_B)
        self._run = True

    # ------------------------------------------------------------------
    # Step 1: App Reset & Launch
    # ------------------------------------------------------------------
    def step1_reset_and_launch(self):
        logger.info("=== STEP 1: App Reset & Launch (Device A) ===")
        self.device_a.clear_app_data(PACKAGE)
        self.device_a.launch_app(PACKAGE)
        logger.info("Waiting 5 seconds for app to fully open...")
        time.sleep(5)

    # ------------------------------------------------------------------
    # Step 2: Detect 2.png
    # ------------------------------------------------------------------
    def step2_detect_2png(self) -> bool:
        """Returns True if found and clicked, False on timeout."""
        logger.info("=== STEP 2: Detect 2.png (Device A) ===")
        coords = self.device_a.wait_for_image("2.png", timeout=20, interval=2)
        if coords is None:
            logger.warning("Step 2: 2.png not found within 20s. Restarting from Step 1.")
            return False
        self.device_a.tap(*coords)
        return True

    # ------------------------------------------------------------------
    # Step 3: Detect 20.png Twice
    # ------------------------------------------------------------------
    def step3_detect_20png_twice(self):
        """Click 20.png twice. Skips to Step 4 if either detection times out."""
        logger.info("=== STEP 3: Detect 20.png Twice (Device A) ===")

        logger.info("Step 3: Waiting for 20.png (first appearance)...")
        coords = self.device_a.wait_for_image("20.png", timeout=5, interval=2)
        if coords is None:
            logger.warning("Step 3: First 20.png not found (timeout). Skipping to Step 4.")
            return
        self.device_a.tap(*coords)

        logger.info("Step 3: Waiting for 20.png (second appearance)...")
        coords = self.device_a.wait_for_image("20.png", timeout=5, interval=2)
        if coords is None:
            logger.warning("Step 3: Second 20.png not found (timeout). Skipping to Step 4.")
            return
        self.device_a.tap(*coords)
        logger.info("Step 3: Completed both 20.png clicks.")

    # ------------------------------------------------------------------
    # Step 4: Get Number & Copy (Device B)
    # ------------------------------------------------------------------
    def step4_get_number(self) -> str:
        """
        Returns the phone number copied from Device B, or empty string on failure.
        """
        logger.info("=== STEP 4: Get Number & Copy (Device B) ===")
        return self._step4_select_and_copy()

    def _step4_select_and_copy(self) -> str:
        """Internal: select number source, copy, return clipboard text."""
        # 4.1 Select number source
        source_images = ["30.png", "30.1.png", "30.2.png", "30.3.png", "30.4.png"]
        selected = False
        for img in source_images:
            coords = self.device_b.find_image(img)
            if coords:
                logger.info("Step 4.1: Found %s, clicking.", img)
                self.device_b.tap(*coords)
                selected = True
                break
        if not selected:
            logger.warning("Step 4.1: No source image found among %s", source_images)

        # 4.2 Copy number via 31.png
        return self._step4_copy(attempt_recovery=True)

    def _step4_copy(self, attempt_recovery: bool = True) -> str:
        """Find 31.png and click to copy. Returns clipboard text."""
        logger.info("Step 4.2: Waiting for 31.png to copy number...")
        coords = self.device_b.wait_for_image("31.png", timeout=10, interval=2)
        if coords:
            self.device_b.tap(*coords)
            time.sleep(1)
            number = self.device_b.get_clipboard()
            if number:
                logger.info("Step 4.2: Copied number: %r", number)
                return number
            logger.warning("Step 4.2: Clipboard empty after clicking 31.png.")
        else:
            logger.warning("Step 4.2: 31.png not found within 10s.")

        # 4.3 Recovery
        if attempt_recovery:
            logger.info("Step 4.3: Attempting recovery via 32.png...")
            coords32 = self.device_b.wait_for_image("32.png", timeout=10, interval=2)
            if coords32:
                self.device_b.tap(*coords32)
                time.sleep(1)
                # Re-execute 4.1 and 4.2 (no further recovery to avoid infinite loop)
                source_images = ["30.png", "30.1.png", "30.2.png", "30.3.png", "30.4.png"]
                for img in source_images:
                    c = self.device_b.find_image(img)
                    if c:
                        self.device_b.tap(*c)
                        break
                return self._step4_copy(attempt_recovery=False)
            else:
                logger.warning("Step 4.3: 32.png not found either.")

        return ""

    # ------------------------------------------------------------------
    # Step 5: Invalid Number Handling (Device A)
    # ------------------------------------------------------------------
    def step5_enter_number(self, number: str) -> bool:
        """
        Paste number, click 3.png, handle invalid number loop.
        Returns True when a valid screen is reached, False on unrecoverable error.
        """
        logger.info("=== STEP 5: Enter Number (Device A) ===")
        success_images = ["5.png", "5.1.png", "6.png"]
        success_texts = ["see more", "sms"]

        while True:
            # Paste number
            self.device_a.paste_text(number)
            time.sleep(0.5)

            # Click 3.png immediately
            coords3 = self.device_a.wait_for_image("3.png", timeout=10, interval=1)
            if coords3:
                self.device_a.tap(*coords3)
            else:
                logger.warning("Step 5: 3.png not found; continuing anyway.")

            time.sleep(2)

            # Check for invalid number indicator (4.png)
            coords4 = self.device_a.find_image("4.png")
            if coords4:
                logger.info("Step 5: Invalid number detected (4.png). Getting new number from Device B.")
                self.device_a.tap(*coords4)
                time.sleep(1)
                new_number = self.step4_get_number()
                if not new_number:
                    logger.error("Step 5: Failed to get new number from Device B.")
                    return False
                number = new_number
                continue

            # Check for success conditions
            for img in success_images:
                if self.device_a.find_image(img):
                    logger.info("Step 5: Success image %s found.", img)
                    return True

            screen_text = self.device_a.get_text_on_screen()
            for t in success_texts:
                if t in screen_text.lower():
                    logger.info("Step 5: Success text %r found.", t)
                    return True

            # Unknown state — wait a moment and recheck
            logger.info("Step 5: Waiting for valid screen...")
            time.sleep(2)

            for img in success_images:
                if self.device_a.find_image(img):
                    return True
            screen_text = self.device_a.get_text_on_screen()
            for t in success_texts:
                if t in screen_text.lower():
                    return True

    # ------------------------------------------------------------------
    # Step 6: Account Recovery Flow (Device A)
    # ------------------------------------------------------------------
    def step6_account_recovery(self) -> bool:
        """
        Handle the account recovery screens. Returns True to continue,
        False if the flow should restart from Step 1.
        """
        logger.info("=== STEP 6: Account Recovery Flow (Device A) ===")

        max_iterations = 30
        for iteration in range(max_iterations):
            logger.info("Step 6: Iteration %d", iteration + 1)

            # 6.1 Check for 5.png or 5.1.png (account list)
            for img in ["5.png", "5.1.png"]:
                coords = self.device_a.find_image(img)
                if coords:
                    logger.info("Step 6.1: Found %s, tapping first list item area.", img)
                    self.device_a.tap(coords[0], coords[1] + 80)
                    time.sleep(1)
                    break

            # 6.2 Check for 6.png
            coords6 = self.device_a.find_image("6.png")
            if coords6:
                logger.info("Step 6.2: Found 6.png, clicking.")
                self.device_a.tap(*coords6)
                time.sleep(1)

            # 6.3 Check for "See more" text
            if self.device_a.text_visible("See more"):
                logger.info("Step 6.3: 'See more' found, scrolling then clicking.")
                self.device_a.scroll_down()
                time.sleep(1)
                if self.device_a.text_visible("See more"):
                    self._tap_text_on_screen_a("See more")
                time.sleep(1)

            # 6.4 Check for SMS
            if self.device_a.text_visible("SMS"):
                logger.info("Step 6.4: 'SMS' found.")
                countdown = self.device_a.find_countdown_near_sms()
                logger.info("Step 6.4: Countdown detected: %d", countdown)

                if countdown > 43:
                    logger.info("Step 6.4: Countdown > 43s. Aborting and restarting from Step 1.")
                    return False
                elif countdown > 0:
                    logger.info("Step 6.4: Waiting %d seconds for countdown...", countdown)
                    time.sleep(countdown)
                    self._tap_text_on_screen_a("SMS")
                else:
                    logger.info("Step 6.4: No countdown, clicking SMS immediately.")
                    self._tap_text_on_screen_a("SMS")

                return True

            time.sleep(2)

        logger.warning("Step 6: Max iterations reached without completing.")
        return False

    def _tap_text_on_screen_a(self, text: str) -> bool:
        """
        Attempt to tap a UI element with matching text on Device A via uiautomator dump.
        Returns True if tapped successfully.
        """
        try:
            self.device_a._adb("shell", "uiautomator", "dump", "/sdcard/ui_dump.xml", timeout=15)
            xml_bytes = subprocess.run(
                ["adb", "-s", self.device_a.serial, "exec-out", "cat", "/sdcard/ui_dump.xml"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=15,
            ).stdout
            xml_str = xml_bytes.decode("utf-8", errors="replace")
            if xml_str.strip():
                root = ET.fromstring(xml_str)
                for node in root.iter():
                    node_text = node.get("text", "")
                    if text.lower() in node_text.lower():
                        bounds = node.get("bounds", "")
                        m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", bounds)
                        if m:
                            l, t, r, b = int(m.group(1)), int(m.group(2)), int(m.group(3)), int(m.group(4))
                            cx = (l + r) // 2
                            cy = (t + b) // 2
                            logger.info("[%s] Tapping text %r at (%d, %d)",
                                        self.device_a.serial, text, cx, cy)
                            self.device_a.tap(cx, cy)
                            return True
        except Exception as exc:
            logger.debug("_tap_text_on_screen_a failed: %s", exc)

        return False

    # ------------------------------------------------------------------
    # Step 7: Continue - click 3.png after SMS selected
    # ------------------------------------------------------------------
    def step7_continue(self):
        logger.info("=== STEP 7: Click 3.png after SMS selection ===")
        coords = self.device_a.wait_for_image("3.png", timeout=10, interval=2)
        if coords:
            self.device_a.tap(*coords)
        else:
            logger.warning("Step 7: 3.png not found.")

    # ------------------------------------------------------------------
    # Step 8: Verification Check
    # ------------------------------------------------------------------
    def step8_verification_check(self) -> bool:
        """Returns True to continue, False to restart from Step 1."""
        logger.info("=== STEP 8: Verification Check (Device A) ===")

        if self.device_a.text_visible("Before we send the code"):
            logger.info("Step 8: CAPTCHA Problem detected. Restarting from Step 1.")
            return False

        coords10 = self.device_a.find_image("10.png")
        if coords10:
            logger.info("Step 8: 10.png found, clicking.")
            self.device_a.tap(*coords10)
            logger.info("Step 8: Waiting for 11.png (max 10s)...")
            coords11 = self.device_a.wait_for_image("11.png", timeout=10, interval=2)
            if coords11:
                logger.info("Step 8: 11.png found.")

            coords3 = self.device_a.wait_for_image("3.png", timeout=10, interval=2)
            if coords3:
                self.device_a.tap(*coords3)
            time.sleep(2)

        return True

    # ------------------------------------------------------------------
    # Step 9: Final Verification
    # ------------------------------------------------------------------
    def step9_final_verification(self) -> bool:
        """
        Returns True to restart the cycle, False to continue monitoring.
        Callers should restart Step 1 when True is returned.
        """
        logger.info("=== STEP 9: Final Verification (Device A) ===")

        screen_text = self.device_a.get_text_on_screen()

        if "before we send the code" in screen_text.lower():
            logger.info("Step 9: CAPTCHA Problem. Restarting from Step 1.")
            return True

        if "check your sms message" in screen_text.lower():
            logger.info("Step 9: SUCCESS - 'Check your SMS message' detected!")
            return True

        logger.info("Step 9: No terminal condition found. Continuing to monitor.")
        return False

    # ------------------------------------------------------------------
    # Main run loop
    # ------------------------------------------------------------------
    def run(self):
        logger.info("Facebook Lite ADB Automation started.")
        logger.info("Device A: %s | Device B: %s | Package: %s", DEVICE_A, DEVICE_B, PACKAGE)

        while self._run:
            try:
                # Step 1
                self.step1_reset_and_launch()

                # Step 2
                if not self.step2_detect_2png():
                    continue  # Restart from Step 1

                # Step 3
                self.step3_detect_20png_twice()

                # Step 4
                number = self.step4_get_number()
                if not number:
                    logger.error("Step 4: No number obtained. Restarting from Step 1.")
                    continue

                # Step 5
                if not self.step5_enter_number(number):
                    logger.error("Step 5: Failed. Restarting from Step 1.")
                    continue

                # Step 6
                if not self.step6_account_recovery():
                    logger.info("Step 6 requested restart.")
                    continue

                # Step 7
                self.step7_continue()
                time.sleep(2)

                # Step 8
                if not self.step8_verification_check():
                    logger.info("Step 8 requested restart (CAPTCHA).")
                    continue

                # Step 9
                self.step9_final_verification()
                # Always restart the cycle after Step 9 per spec
                logger.info("Cycle complete. Restarting from Step 1.")

            except KeyboardInterrupt:
                logger.info("KeyboardInterrupt received. Stopping automation.")
                self._run = False
                break
            except Exception as exc:
                logger.exception("Global error recovery triggered by: %s", exc)
                logger.info("Restarting from Step 1 after unexpected error.")
                time.sleep(2)
                continue

        logger.info("Automation stopped.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    automation = FacebookAutomation()
    automation.run()
