# Image Label Detector

A small web app that accepts an image upload and uses Google Cloud Vision's
Label Detection feature to display recognized objects and concepts with
confidence scores.

## Requirements

- Node.js 24.x
- A Google Cloud project with the Cloud Vision API enabled and billing
  configured
- Google Cloud Application Default Credentials (ADC) with permission to use
  the Vision API

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Set up ADC using one of these methods:

   - Sign in with the Google Cloud CLI:

     ```sh
     gcloud auth application-default login
     ```

   - Or set `GOOGLE_APPLICATION_CREDENTIALS` to the path of a service-account
     key file. Keep the key outside the repository and do not commit it.

3. Start the server:

   ```sh
   npm start
   ```

4. Open [http://localhost:8080](http://localhost:8080), choose an image, and
   select **Detect labels**.

The server uses `PORT` when set and otherwise listens on port `8080`.

## Deploy to Google App Engine

The repository includes an `app.yaml` configured for the Node.js 24 runtime.
Select the desired Google Cloud project, enable the Vision API, ensure the
App Engine service account has permission to call it, and deploy:

```sh
gcloud config set project YOUR_PROJECT_ID
gcloud app deploy
```

## Upload behavior

- Accepts one image at a time, up to 8 MB.
- Uses the image's MIME type to allow image uploads.
- Returns detected labels and confidence percentages, or a message if no
  labels are found or analysis fails.

## npm scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Express server |
