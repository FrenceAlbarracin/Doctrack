const { google } = require('googleapis');
const path = require('path');

class GoogleDriveService {
  constructor() {
    // Load these from environment variables in production
    this.GOOGLE_DRIVE_FOLDER_ID = '1PJLdb0e4UYNeYluCsOIhgEPGZhXZaUq2'; // Create a folder in Drive and put its ID here
    
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../config/google-drive-credentials.json'), // Your credentials file
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    this.driveService = google.drive({ version: 'v3', auth });
  }

  async uploadFile(fileObject) {
    try {
      const fileMetadata = {
        name: fileObject.originalname,
        parents: [this.GOOGLE_DRIVE_FOLDER_ID]
      };

      const media = {
        mimeType: fileObject.mimetype,
        body: fileObject.buffer
      };

      const response = await this.driveService.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,webViewLink'
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.driveService.files.delete({
        fileId: fileId
      });
      return true;
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService(); 