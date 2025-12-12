<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>
#Project Description
Cherie solves the "nothing to wear" paradox and decision fatigue by transforming a chaotic closet into an intelligent, body-aware ecosystem. Built with Gemini 3 Pro, it moves beyond generic organizing to personalized styling based on "Silhouette Theory" using AI reasoning to suggest cuts that scientifically flatter the user's specific geometry.
Gemini’s Multimodal Vision instantly digitizes wardrobes without manual data entry. The app features a "Playhouse" for creative mix-and-match, a "Travel Packer" for context-aware planning, and a "Weekly Journal" to automate mornings. Crucially, Cherie drives sustainability through "Campus Thrift," a marketplace enabling a circular economy. Cherie empowers users to buy less, wear more, and shop with confidence.

How I Built It
I built Cherie entirely in Google AI Studio using Gemini 3 Pro:

Context-Aware Reasoning: I prompted Gemini to analyze user inputs (Height, Shape) and apply fashion rules to styling suggestions, ensuring inclusivity for all body types.
Multimodal Vision: I utilized Gemini Vision to allow users to auto-capture their wardrobe via camera, instantly recognizing garment details without manual typing.
Vibe Coding: I engineered the "Playhouse" interface a drag-and-drop canvas and a custom "Coquette" aesthetic using local storage for a seamless app experience.
Impact
Inclusivity: Democratizes personal styling, making expert "Body Type" advice accessible to everyone.
Sustainability: Reduces textile waste by facilitating garment resale through "Campus Thrift."
Confidence: Reduces decision fatigue, turning getting dressed into a creative, stress-free ritual.
Project Links
Video Demo: https://youtu.be/Z4VUJDcYAnI
Try the App: https://ai.studio/apps/drive/1rwcihQ_zM4gJqGwRub5tcKlneVSFj0Ka?fullscreenApplet=true
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1rwcihQ_zM4gJqGwRub5tcKlneVSFj0Ka
View My App: https://ai.studio/apps/drive/1rwcihQ_zM4gJqGwRub5tcKlneVSFj0Ka?fullscreenApplet=true


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
